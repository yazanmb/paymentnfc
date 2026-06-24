import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('privacy');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if admin email - allow access to regular dashboard
      // Super Admin button will be shown in header for this email
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError(error.message);
    }
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

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 animate-slide-up">
          <div className="text-center">
            <div className="text-8xl mb-6">💳</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              NFC Payment
            </h1>
            <p className="text-xl text-gray-600">
              {t('auth.welcomeBack')}
            </p>
            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl">🔒</div>
                <div>
                  <h3 className="font-semibold text-gray-800">{t('auth.secure')}</h3>
                  <p className="text-sm text-gray-600">{t('auth.secureDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl">⚡</div>
                <div>
                  <h3 className="font-semibold text-gray-800">{t('auth.fast')}</h3>
                  <p className="text-sm text-gray-600">{t('auth.fastDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl">🌍</div>
                <div>
                  <h3 className="font-semibold text-gray-800">{t('auth.global')}</h3>
                  <p className="text-sm text-gray-600">{t('auth.globalDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="card p-8 lg:p-12 animate-scale-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('auth.login')}</h2>
            <p className="text-gray-600">{t('auth.loginSubtitle')}</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder={t('auth.emailPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder={t('auth.passwordPlaceholder')}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">{t('auth.rememberMe')}</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {t('auth.forgotPassword')}
              </button>
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
                t('auth.login')
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {t('auth.noAccount')}{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {t('auth.signup')}
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

export default Login;
