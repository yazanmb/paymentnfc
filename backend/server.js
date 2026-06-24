const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const merchantRoutes = require('./routes/merchantRoutes');
const branchRoutes = require('./routes/branchRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const deviceListRoutes = require('./routes/deviceListRoutes');
const transactionListRoutes = require('./routes/transactionListRoutes');
const nfcRoutes = require('./routes/nfcRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'NFC Payment API Server is running' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes - Organized by dependency order
// Merchant routes (independent, no dependencies)
app.use('/api/merchants', merchantRoutes);

// Branch routes (depend on merchants)
app.use('/api/branches', branchRoutes);

// Device activation route (standalone)
app.use('/api', deviceRoutes);

// Device list routes (depend on branches)
app.use('/api/devices', deviceListRoutes);

// Payment routes (depend on devices)
app.use('/api', paymentRoutes);

// Transaction routes (depend on devices, merchants, branches)
app.use('/api/transactions', transactionListRoutes);

// NFC sticker routes
app.use('/api', nfcRoutes);

// Order routes
app.use('/api', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
