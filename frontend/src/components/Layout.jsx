import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../config/supabase';
import { useEffect, useState, useRef } from 'react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: '📊' },
    { path: '/order-create', label: 'Create Order', icon: '📝' },
    { path: '/merchants', label: t('nav.merchants'), icon: '🏪' },
    { path: '/branches', label: t('nav.branches'), icon: '🏢' },
    { path: '/devices', label: t('nav.devices'), icon: '📱' },
    { path: '/transactions', label: t('nav.transactions'), icon: '💳' },
  ];

  const isRTL = i18n.language === 'ar';
  const userInitials = user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <div className="min-h-screen gradient-bg" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-xl min-h-screen border-r border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                💳
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NFC Payment
                </h1>
                <p className="text-sm text-gray-500">{t('nav.dashboard')}</p>
              </div>
            </div>
          </div>
          <nav className="mt-6 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-100 px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {navItems.find(item => item.path === location.pathname)?.label || ''}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Secret Super Admin Button - Only for yazanmubaraki20@gmail.com */}
                {user?.email === 'yazanmubaraki20@gmail.com' && (
                  <button
                    onClick={() => navigate('/super-admin')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-lg">👑</span>
                    <span className="font-medium">
                      {i18n.language === 'ar' ? 'لوحة السوبر أدمن' : 'Super Admin Dashboard'}
                    </span>
                  </button>
                )}

                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300 border border-gray-200 hover:border-blue-300"
                >
                  <span className="text-xl">{i18n.language === 'en' ? '🇸🇦' : '🇬🇧'}</span>
                  <span className="font-medium text-gray-700">
                    {i18n.language === 'en' ? 'العربية' : 'English'}
                  </span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300 border border-gray-200 hover:border-blue-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {userInitials}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="font-semibold text-gray-800 text-sm">{userName}</p>
                      <p className="text-xs text-gray-500">{t('profile.myProfile')}</p>
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-scale-in z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{userName}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // Navigate to profile page (to be implemented)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <span className="text-xl">👤</span>
                        <span className="text-gray-700">{t('profile.myProfile')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // Navigate to settings page (to be implemented)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <span className="text-xl">⚙️</span>
                        <span className="text-gray-700">{t('profile.settings')}</span>
                      </button>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors text-red-600"
                        >
                          <span className="text-xl">🚪</span>
                          <span>{t('auth.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-8 overflow-auto pb-20">
            {children}
          </div>

          {/* Slim Footer */}
          <div className="bg-white border-t border-gray-100 px-8 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{t('auth.securityValue')}</span>
              <div className="flex items-center gap-6 text-xs">
                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                  {t('auth.termsAndConditions')}
                </button>
                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                  {t('auth.privacyPolicy')}
                </button>
                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                  {t('auth.aboutCompany')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
