import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    storeName: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('privacy');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password || formData.password.length < 6) return 'Password must be at least 6 characters';
    if (!formData.storeName.trim()) return 'Store name is required';
    if (!formData.phoneNumber.trim()) return 'Phone number is required';
    if (!agreedToTerms) return 'You must agree to the terms and conditions';
    return null;
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            store_name: formData.storeName,
            phone_number: formData.phoneNumber,
          },
        },
      });

      if (error) throw error;

      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 animate-slide-up">
          <div className="text-center">
            <div className="text-8xl mb-6">🚀</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {t('auth.createAccount')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('auth.signupSubtitle')}
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl">💼</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Business Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage your business with powerful tools</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl">📊</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Real-time Analytics</h3>
                  <p className="text-sm text-gray-600">Track your sales and performance</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl">🔔</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Instant Notifications</h3>
                  <p className="text-sm text-gray-600">Get notified about every transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="card p-8 lg:p-12 animate-scale-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('auth.createAccount')}</h2>
            <p className="text-gray-600">{t('auth.signupSubtitle')}</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">{t('auth.fullName')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('auth.fullName')}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">{t('auth.phoneNumber')}</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+966 5X XXX XXXX"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('auth.storeName')}</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="input-field"
                placeholder={t('auth.storeName')}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('auth.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder={t('auth.emailPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('auth.password')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder={t('auth.passwordPlaceholder')}
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                {t('auth.agreeTerms')}
              </label>
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
                  {t('auth.loading')}
                </span>
              ) : (
                t('auth.createAccount')
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {t('auth.haveAccount')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {t('auth.login')}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm"
            >
              <span>{i18n.language === 'en' ? '🇸🇦' : '🇬🇧'}</span>
              <span className="text-gray-700">
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Slim Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-4 py-2 animate-slide-up">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('auth.securityValue')}</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <button
              onClick={() => openModal('terms')}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              {t('auth.termsAndConditions')}
            </button>
            <button
              onClick={() => openModal('privacy')}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              {t('auth.privacyPolicy')}
            </button>
            <button
              onClick={() => openModal('about')}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              {t('auth.aboutCompany')}
            </button>
          </div>
        </div>
      </div>

      {/* Security Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'privacy' ? t('modal.privacyTitle') : modalType === 'about' ? t('auth.aboutCompany') : t('modal.termsTitle')}
      >
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg">{t('modal.securityContent.title')}</h4>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-start gap-2">
              <span className="text-lg">🔐</span>
              <span>{t('modal.securityContent.encryption')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">💳</span>
              <span>{t('modal.securityContent.stripe')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">📱</span>
              <span>{t('modal.securityContent.nfc')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🛡️</span>
              <span>{t('modal.securityContent.data')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span>{t('modal.securityContent.compliance')}</span>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Signup;
