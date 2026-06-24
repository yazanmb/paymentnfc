import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const NfcActivation = () => {
  const [searchParams] = useSearchParams();
  const sticker_uid = searchParams.get('uid');
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    activation_code: '',
    table_name: '',
    branch_id: ''
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stickerStatus, setStickerStatus] = useState(null);

  useEffect(() => {
    // Fetch sticker status
    const fetchStickerStatus = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nfc/stickers/${sticker_uid}`);
        setStickerStatus(response.data);
        
        if (response.data.status === 'activated') {
          // Redirect to payment page if already activated
          navigate(`/pay/${sticker_uid}`);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError(t('auth.stickerNotFound'));
        }
      }
    };

    // Fetch branches
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/branches`);
        setBranches(response.data);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };

    fetchStickerStatus();
    fetchBranches();
  }, [sticker_uid, navigate, t]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nfc/activate`, {
        sticker_uid,
        activation_code: formData.activation_code,
        branch_id: formData.branch_id,
        table_name: formData.table_name
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/pay/${sticker_uid}`);
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(t('auth.activationError'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (error === t('auth.stickerNotFound')) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('auth.stickerNotFound')}</h2>
          <p className="text-gray-600 mb-6">The NFC sticker you scanned is not registered in our system.</p>
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

  if (success) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('auth.activationSuccess')}</h2>
          <p className="text-gray-600">Redirecting to payment page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full animate-scale-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('auth.nfcActivation')}</h2>
          <p className="text-gray-600">{t('auth.nfcActivationSubtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">{t('auth.activationCode')}</label>
            <input
              type="text"
              name="activation_code"
              value={formData.activation_code}
              onChange={handleChange}
              className="input-field"
              placeholder={t('auth.activationCodePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">{t('auth.tableName')}</label>
            <input
              type="text"
              name="table_name"
              value={formData.table_name}
              onChange={handleChange}
              className="input-field"
              placeholder={t('auth.tableNamePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">{t('auth.selectBranch')}</label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">{t('auth.selectBranch')}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
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
                {t('auth.activating')}
              </span>
            ) : (
              t('auth.activateButton')
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

export default NfcActivation;
