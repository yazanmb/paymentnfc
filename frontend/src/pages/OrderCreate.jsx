import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const OrderCreate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    branch_id: '',
    table_name: '',
    amount: '',
  });
  const [branches, setBranches] = useState([]);
  const [devices, setDevices] = useState([]);
  const [merchantId, setMerchantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBranches();
    // In a real app, you'd get merchant_id from auth session
    // For now, we'll use a default or fetch from first merchant
    fetchMerchantId();
  }, []);

  useEffect(() => {
    if (formData.branch_id) {
      fetchDevicesByBranch(formData.branch_id);
    } else {
      setDevices([]);
      setFormData(prev => ({ ...prev, table_name: '' }));
    }
  }, [formData.branch_id]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/branches`);
      setBranches(response.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchMerchantId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/merchants`);
      if (response.data && response.data.length > 0) {
        setMerchantId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching merchant:', err);
    }
  };

  const fetchDevicesByBranch = async (branchId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nfc/stickers`);
      // Filter stickers that are activated and belong to this branch
      const activatedDevices = response.data.filter(
        device => device.branch_id === parseInt(branchId) && device.status === 'activated'
      );
      setDevices(activatedDevices);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setDevices([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleKeypadPress = (value) => {
    const currentAmountStr = formData.amount || '0.00';
    const currentAmount = parseFloat(currentAmountStr);
    let newAmount;
    
    if (value === '00') {
      newAmount = currentAmount * 100;
    } else if (value === 'delete') {
      newAmount = Math.floor(currentAmount / 10);
    } else {
      newAmount = currentAmount * 10 + parseInt(value);
    }
    
    setFormData({
      ...formData,
      amount: (newAmount / 100).toFixed(2)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
        branch_id: formData.branch_id,
        merchant_id: merchantId,
        table_name: formData.table_name,
        amount: parseFloat(formData.amount),
        currency: 'SAR',
      });

      if (response.data.success) {
        setSuccess('Order created/updated successfully!');
        setFormData({ branch_id: '', table_name: '', amount: '' });
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full animate-scale-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Order</h2>
          <p className="text-gray-600">Enter price and select table to activate NFC payment</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Branch</label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Table Name</label>
            <select
              name="table_name"
              value={formData.table_name}
              onChange={handleChange}
              className="input-field"
              disabled={!formData.branch_id || devices.length === 0}
              required
            >
              <option value="">Select Table</option>
              {devices.map((device) => (
                <option key={device.id} value={device.table_name}>
                  {device.table_name} ({device.sticker_uid})
                </option>
              ))}
            </select>
            {!formData.branch_id && (
              <p className="text-sm text-gray-500 mt-1">Please select a branch first</p>
            )}
            {formData.branch_id && devices.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No activated tables found for this branch</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Amount (SAR)</label>
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="bg-white rounded-lg px-4 py-3 mb-3 text-center">
                <span className="text-3xl font-bold text-gray-800">{formData.amount || '0.00'} ر.س</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'delete'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className={`py-3 rounded-lg font-bold text-lg transition-colors ${
                      key === 'delete'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {key === 'delete' ? '⌫' : key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Order & Activate NFC'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCreate;
