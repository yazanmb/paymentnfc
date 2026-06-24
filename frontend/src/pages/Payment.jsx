import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Payment = () => {
  const { sticker_uid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stickerInfo, setStickerInfo] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [fetchingInfo, setFetchingInfo] = useState(true);
  const [branchStripeKeys, setBranchStripeKeys] = useState(null);

  useEffect(() => {
    const fetchStickerInfo = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nfc/validate/${sticker_uid}`);
        setStickerInfo(response.data.sticker);

        // Fetch branch Stripe keys
        if (response.data.sticker.branch_id) {
          const branchResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/branches/${response.data.sticker.branch_id}`);
          setBranchStripeKeys({
            stripe_secret_key: branchResponse.data.stripe_secret_key,
            stripe_publishable_key: branchResponse.data.stripe_publishable_key,
          });
        }

        // Fetch order for this table
        if (response.data.sticker.branch_id && response.data.sticker.table_name) {
          const orderResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${response.data.sticker.branch_id}/${response.data.sticker.table_name}`
          );
          setOrderInfo(orderResponse.data.order);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Sticker not found or not activated');
          setTimeout(() => navigate(`/nfc/${sticker_uid}`), 2000);
        } else {
          setError('Failed to load sticker information');
        }
      } finally {
        setFetchingInfo(false);
      }
    };

    fetchStickerInfo();
  }, [sticker_uid, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use branch-specific Stripe keys for payment
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments`, {
        amount: orderInfo?.amount || 0,
        nfc_uid: sticker_uid,
        merchant_id: stickerInfo.merchant.id,
        branch_id: stickerInfo.branch.id,
        table_name: stickerInfo.table_name,
        stripe_secret_key: branchStripeKeys?.stripe_secret_key,
        stripe_publishable_key: branchStripeKeys?.stripe_publishable_key,
      });

      if (response.data.success) {
        alert('Payment successful!');
        navigate('/');
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingInfo) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Fetching order information</p>
        </div>
      </div>
    );
  }

  if (error && !stickerInfo) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const amount = orderInfo?.amount || 0;

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full animate-scale-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment</h2>
          <p className="text-gray-600">{stickerInfo?.branch?.branch_name} - {stickerInfo?.table_name}</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
            {error}
          </div>
        )}

        {!orderInfo ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-6">
            No active order found for this table. Please ask the cashier to create an order.
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                <p className="text-5xl font-bold text-gray-800">{amount.toFixed(2)} ر.س</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Merchant:</span>
                <span className="font-medium text-gray-800">{stickerInfo?.merchant?.business_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Branch:</span>
                <span className="font-medium text-gray-800">{stickerInfo?.branch?.branch_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Table:</span>
                <span className="font-medium text-gray-800">{stickerInfo?.table_name}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Pay Now'
              )}
            </button>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Pay with Apple Pay
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
