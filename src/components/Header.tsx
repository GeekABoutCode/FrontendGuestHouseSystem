import React from 'react';
import { Home, User, Shield, Menu, Calendar, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContextWithApi';

export default function Header() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleUserRole = () => {
    if (state.isAdminLoggedIn) {
      // Logout admin
      dispatch({ type: 'SET_ADMIN_LOGIN', payload: false });
      dispatch({
        type: 'SET_USER',
        payload: {
          id: '1',
          name: 'Guest User',
          email: 'guest@example.com',
          role: 'user'
        }
      });
      navigate('/');
    } else {
      // Switch to admin login
      navigate('/admin/login');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                GuestHouse<span className="text-blue-600">Pro</span>
              </h1>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <button
                onClick={() => navigate('/')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Properties
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/bookings'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </button>
              {state.isAdminLoggedIn && (
                <button
                  onClick={() => navigate('/admin')}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/admin'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleUserRole}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                state.isAdminLoggedIn
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {state.isAdminLoggedIn ? (
                <LogOut className="w-4 h-4 mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {state.isAdminLoggedIn ? 'Logout' : 'Admin Login'}
            </button>
            
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-1" />
              {state.currentUser?.name}
            </div>

            <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}