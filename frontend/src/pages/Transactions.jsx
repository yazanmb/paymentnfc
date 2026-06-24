import { useState, useEffect } from 'react';
import { transactionsAPI, devicesAPI, merchantsAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

const Transactions = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const filterTransactionsByTime = (transactions, filter) => {
    if (filter === 'all') return transactions;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      
      switch (filter) {
        case 'daily':
          return transactionDate >= today;
        case 'monthly':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return transactionDate >= monthStart;
        case 'yearly':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          return transactionDate >= yearStart;
        default:
          return true;
      }
    });
  };

  const fetchData = async () => {
    try {
      const [transactionsRes, devicesRes, merchantsRes] = await Promise.all([
        transactionsAPI.getAll().catch(() => ({ data: [] })),
        devicesAPI.getAll().catch(() => ({ data: [] })),
        merchantsAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setTransactions(transactionsRes.data || []);
      setDevices(devicesRes.data || []);
      setMerchants(merchantsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? device.device_name || device.device_uid : 'Unknown';
  };

  const getMerchantName = (merchantId) => {
    const merchant = merchants.find(m => m.id === merchantId);
    return merchant ? merchant.business_name : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const statusMatch = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter.toLowerCase();
    const timeFiltered = filterTransactionsByTime([transaction], timeFilter);
    return statusMatch && timeFiltered.length > 0;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('transactions.title')}</h1>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('transactions.all')}</option>
            <option value="completed">{t('transactions.completed')}</option>
            <option value="pending">{t('transactions.pending')}</option>
            <option value="failed">{t('transactions.failed')}</option>
          </select>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('transactions.all')}</option>
            <option value="daily">{t('transactions.daily')}</option>
            <option value="monthly">{t('transactions.monthly')}</option>
            <option value="yearly">{t('transactions.yearly')}</option>
          </select>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Merchant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NFC UID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                  No transactions found. Transactions will appear here when payments are made.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{transaction.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getDeviceName(transaction.device_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getMerchantName(transaction.merchant_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.customer_name || transaction.customer_email || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {transaction.nfc_uid || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-800">{transactions.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-green-800">
                ${transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-purple-800">
                {transactions.length > 0
                  ? ((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
