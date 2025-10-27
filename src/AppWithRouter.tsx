import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContextWithApi';
import HomePage from './components/HomePage';
import PropertyDetails from './components/PropertyDetails';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import PaymentProof from './components/PaymentProof';
import BookingLookup from './components/BookingLookup';
import { useApp } from './context/AppContextWithApi';
import { Property } from './types';

// Main App Content with Router
function AppContent() {
  const { state } = useApp();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/property/:propertyId" element={<PropertyDetails />} />
        <Route path="/bookings" element={<BookingLookup />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            state.isAdminLoggedIn ? 
              <AdminPanel /> : 
              <Navigate to="/admin/login" replace />
          } 
        />
        <Route 
          path="/admin/login" 
          element={
            state.isAdminLoggedIn ? 
              <Navigate to="/admin" replace /> : 
              <AdminLogin />
          } 
        />
        
        {/* Payment Route */}
        <Route 
          path="/payment/:bookingId" 
          element={<PaymentProof />} 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
