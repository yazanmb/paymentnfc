const Transaction = require('../models/Transaction');
const Device = require('../models/Device');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment endpoint
const createPayment = async (req, res) => {
  try {
    const { 
      device_uid, 
      amount, 
      currency = 'USD',
      customer_name, 
      customer_email,
      nfc_uid,
      simulate = false
    } = req.body;

    if (!device_uid || !amount) {
      return res.status(400).json({ 
        error: 'device_uid and amount are required' 
      });
    }

    // Find device
    const device = await Device.findByUid(device_uid);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (!device.is_active) {
      return res.status(400).json({ error: 'Device is not active' });
    }

    // Update device last seen
    await Device.updateLastSeen(device_uid);

    let stripePaymentIntentId = null;
    let isDemoTransaction = false;
    const stripeMode = process.env.STRIPE_MODE || 'test';
    const nfcSimulationMode = process.env.NFC_SIMULATION_MODE === 'true';

    // Check if simulation mode is enabled
    if (simulate || nfcSimulationMode) {
      console.log('Using simulation mode for payment');
      isDemoTransaction = true;
    } else if (stripeMode === 'test') {
      // Stripe test mode - use test keys
      const stripeConfigured = process.env.STRIPE_SECRET_KEY && 
                             process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_test_secret_key';

      if (stripeConfigured) {
        try {
          // Create Stripe Payment Intent in test mode
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
              device_uid: device_uid,
              merchant_id: device.merchant_id,
              branch_id: device.branch_id,
              mode: 'test'
            }
          });
          stripePaymentIntentId = paymentIntent.id;
          console.log('Stripe test mode payment created:', paymentIntent.id);
        } catch (stripeError) {
          console.error('Stripe test mode error, falling back to demo transaction:', stripeError.message);
          isDemoTransaction = true;
        }
      } else {
        // Stripe not configured, use demo mode
        console.log('Stripe test mode not configured, using demo transaction mode');
        isDemoTransaction = true;
      }
    }

    // Create transaction record
    const transaction = await Transaction.create({
      device_id: device.id,
      merchant_id: device.merchant_id,
      branch_id: device.branch_id,
      amount: amount,
      currency: currency,
      status: 'completed',
      stripe_payment_intent_id: stripePaymentIntentId,
      customer_name: customer_name || null,
      customer_email: customer_email || null,
      nfc_uid: nfc_uid || null
    });

    const response = {
      message: isDemoTransaction ? 'Demo transaction created successfully' : 'Payment created successfully',
      transaction: transaction,
      is_demo: isDemoTransaction,
      mode: stripeMode
    };

    if (!isDemoTransaction && stripePaymentIntentId) {
      response.payment_intent_id = stripePaymentIntentId;
      response.client_secret = (await stripe.paymentIntents.retrieve(stripePaymentIntentId)).client_secret;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ 
      error: 'Error creating payment',
      details: error.message 
    });
  }
};

// Simulate NFC Tap endpoint (Demo/Mock)
const simulateNfcTap = async (req, res) => {
  try {
    const { 
      device_id, 
      amount = 10.00, 
      currency = 'USD',
      customer_name = 'Demo Customer', 
      customer_email = 'demo@example.com',
      nfc_uid = 'DEMO_' + Date.now()
    } = req.body;

    if (!device_id) {
      return res.status(400).json({ 
        error: 'device_id is required' 
      });
    }

    // Find device by ID
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Get merchant_id from branch
    const branch = await require('../models/Branch').findById(device.branch_id);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Create demo transaction directly (simulation mode)
    const transaction = await Transaction.create({
      device_id: device.id,
      merchant_id: branch.merchant_id,
      branch_id: device.branch_id,
      amount: amount,
      currency: currency,
      status: 'completed',
      stripe_payment_intent_id: null,
      customer_name: customer_name,
      customer_email: customer_email,
      nfc_uid: nfc_uid
    });

    res.status(201).json({ 
      message: 'NFC tap simulated successfully in test mode',
      transaction: transaction,
      is_demo: true,
      mode: 'test'
    });
  } catch (error) {
    console.error('Error simulating NFC tap:', error);
    res.status(500).json({ 
      error: 'Error simulating NFC tap',
      details: error.message 
    });
  }
};

// Check payment by NFC UID endpoint
const checkPayment = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    // Find transaction by NFC UID
    const transaction = await Transaction.findByNfcUid(uid);

    if (!transaction) {
      return res.status(404).json({ 
        message: 'No transaction found for this NFC UID',
        transaction: null
      });
    }

    // Check payment status with Stripe
    if (transaction.stripe_payment_intent_id) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        transaction.stripe_payment_intent_id
      );

      // Update transaction status based on Stripe status
      if (paymentIntent.status !== transaction.status) {
        await Transaction.updateStatus(transaction.id, paymentIntent.status);
        transaction.status = paymentIntent.status;
      }
    }

    res.status(200).json({ 
      message: 'Transaction found',
      transaction: transaction
    });
  } catch (error) {
    console.error('Error checking payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createPayment, checkPayment, simulateNfcTap };
