import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Merchants from './pages/Merchants';
import Branches from './pages/Branches';
import Devices from './pages/Devices';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NfcActivation from './pages/NfcActivation';
import Payment from './pages/Payment';
import SuperAdmin from './pages/SuperAdmin';
import OrderCreate from './pages/OrderCreate';
import { supabase } from './config/supabase';

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/super-admin" element={<SuperAdmin />} />
        <Route path="/order-create" element={
          <ProtectedRoute>
            <OrderCreate />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/merchants" element={
          <ProtectedRoute>
            <Merchants />
          </ProtectedRoute>
        } />
        <Route path="/branches" element={
          <ProtectedRoute>
            <Branches />
          </ProtectedRoute>
        } />
        <Route path="/devices" element={
          <ProtectedRoute>
            <Devices />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="/nfc/:sticker_uid" element={<NfcActivation />} />
        <Route path="/activate" element={<NfcActivation />} />
        <Route path="/pay/:sticker_uid" element={<Payment />} />
      </Routes>
    </Router>
  );
}

export default App;
