import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppProvider } from './context/AppContextWithApi';
import HomePage from './components/HomePage';
import PropertyDetails from './components/PropertyDetails';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import PaymentProof from './components/PaymentProof';
import BookingLookup from './components/BookingLookup';
import Header from './components/Header';
import { useApp } from './context/AppContextWithApi';
import { Property } from './types';

// Property Details Wrapper to handle routing
function PropertyDetailsWrapper() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { state } = useApp();
  
  const property = state.properties.find(p => p.id === propertyId);
  
  if (!property) {
    return <Navigate to="/" replace />;
  }
  
  return <PropertyDetails property={property} />;
}

// Payment Proof Wrapper to handle routing
function PaymentProofWrapper() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { state } = useApp();
  
  const booking = state.bookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return <Navigate to="/" replace />;
  }
  
  return <PaymentProof booking={booking} />;
}

// Admin Panel Wrapper
function AdminPanelWrapper() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'SET_ADMIN_LOGIN', payload: false });
    navigate('/');
  };

  if (!state.isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminPanel onLogout={handleLogout} />;
}

// Admin Login Wrapper
function AdminLoginWrapper() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleLoginSuccess = (user: any) => {
    dispatch({ type: 'SET_ADMIN_LOGIN', payload: true });
    navigate('/admin');
  };

  if (state.isAdminLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}

// Main App Content with Router
function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/property/:propertyId" element={<PropertyDetailsWrapper />} />
        <Route path="/bookings" element={<BookingLookup />} />
        
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPanelWrapper />} />
        <Route path="/admin/login" element={<AdminLoginWrapper />} />
        
        {/* Payment Route */}
        <Route path="/payment/:bookingId" element={<PaymentProofWrapper />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;