import React, { useState } from 'react';
import { PropertyApiService } from '../lib/api/propertyApi';
import { BookingApiService } from '../lib/api/bookingApi';

/**
 * Simple component to test API connection
 * This can be temporarily added to your app to verify the backend connection
 */
export default function TestApiConnection() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testApiConnection = async () => {
    setStatus('testing');
    setMessage('Testing API connection...');

    try {
      // Test properties endpoint
      const properties = await PropertyApiService.getAllProperties();
      setStatus('success');
      setMessage(`✅ API Connection Successful! Found ${properties.length} properties.`);
    } catch (error) {
      setStatus('error');
      setMessage(`❌ API Connection Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">API Connection Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testApiConnection}
          disabled={status === 'testing'}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            status === 'testing'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {status === 'testing' ? 'Testing...' : 'Test API Connection'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            status === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : status === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>API Base URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}</p>
          <p>Make sure your Spring Boot backend is running on port 8080</p>
        </div>
      </div>
    </div>
  );
}
