import { useState, useEffect } from 'react';
import { merchantsAPI, branchesAPI, devicesAPI, transactionsAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    merchants: 0,
    branches: 0,
    devices: 0,
    transactions: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('daily');

  useEffect(() => {
    fetchStats();
  }, [timeFilter]);

  const filterTransactionsByTime = (transactions, filter) => {
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

  const fetchStats = async () => {
    try {
      const [merchantsRes, branchesRes, devicesRes, transactionsRes] = await Promise.all([
        merchantsAPI.getAll().catch(() => ({ data: [] })),
        branchesAPI.getAll().catch(() => ({ data: [] })),
        devicesAPI.getAll().catch(() => ({ data: [] })),
        transactionsAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const allTransactions = transactionsRes.data || [];
      const filteredTransactions = filterTransactionsByTime(allTransactions, timeFilter);
      const totalSales = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      setStats({
        merchants: merchantsRes.data?.length || 0,
        branches: branchesRes.data?.length || 0,
        devices: devicesRes.data?.length || 0,
        transactions: filteredTransactions.length,
        totalSales: totalSales,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: t('dashboard.totalSales'), value: `$${stats.totalSales.toFixed(2)}`, icon: '💰', color: 'bg-blue-500' },
    { title: t('dashboard.totalTransactions'), value: stats.transactions, icon: '💳', color: 'bg-green-500' },
    { title: t('dashboard.activeDevices'), value: stats.devices, icon: '📱', color: 'bg-purple-500' },
    { title: t('dashboard.revenue'), value: `$${stats.totalSales.toFixed(2)}`, icon: '�', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
        <div className="flex gap-2">
          {['daily', 'monthly', 'yearly'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t(`dashboard.${filter}`)}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} text-white text-4xl p-3 rounded-full`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to NFC Payment System</h2>
        <p className="text-gray-600 mb-4">
          Manage your merchants, branches, devices, and track transactions from this dashboard.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Quick Actions</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Add new merchants</li>
              <li>• Create branches</li>
              <li>• Activate NFC devices</li>
              <li>• Monitor transactions</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">System Status</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Backend: Connected</li>
              <li>• Database: Supabase</li>
              <li>• Payment: Stripe</li>
              <li>• Status: Active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
