import React, { useState } from 'react';
import { Search, Filter, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types';
import PropertyCard from './PropertyCard';
import { useApp } from '../context/AppContextWithApi';

export default function HomePage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const handleSelectProperty = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  const filteredProperties = state.properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
                           property.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = Array.from(new Set(state.properties.map(p => 
    p.location.split(',')[1]?.trim() || p.location
  ))).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-blue-600 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover unique properties, comfortable rooms, and exceptional experiences 
              at the best prices.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Properties
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or description..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Locations</option>
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <button
                      onClick={() => {
                        // Search functionality is already handled by state changes
                        // This button can be used for additional search actions if needed
                      }}
                      className="w-full bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Properties
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {filteredProperties.length === state.properties.length 
                ? 'All Properties' 
                : `${filteredProperties.length} Properties Found`}
            </h2>
            <p className="text-gray-600 mt-2">
              Choose from our selection of premium properties
            </p>
          </div>
          
          {/* Stats */}
          <div className="hidden md:flex space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{state.properties.length}</div>
              <div className="text-sm text-gray-600">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {state.properties.reduce((total, p) => total + p.rooms.filter(r => r.available).length, 0)}
              </div>
              <div className="text-sm text-gray-600">Available Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(state.properties.reduce((total, p) => total + p.rating, 0) / state.properties.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all properties</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelect={handleSelectProperty}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Featured Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose GuestHousePro?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the best in hospitality with our premium properties and exceptional service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                All our properties are carefully selected and maintained to the highest standards
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Prime Locations</h3>
              <p className="text-gray-600">
                Strategic locations near attractions, business districts, and transportation hubs
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple, secure, and instant booking process with flexible options
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}