import React, { useState, useEffect } from 'react';
import { Addon } from '../types';
import { useActiveAddons } from '../hooks/useAddons';

interface AddonSelectionProps {
  selectedAddonIds: string[];
  onAddonSelectionChange: (addonIds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  basePrice: number;
}

interface AddonCardProps {
  addon: Addon;
  isSelected: boolean;
  onToggle: () => void;
}

const AddonCard: React.FC<AddonCardProps> = ({ addon, isSelected, onToggle }) => {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggle}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <h3 className="text-lg font-semibold text-gray-900">{addon.name}</h3>
          </div>
          {addon.description && (
            <p className="text-gray-600 mt-2 text-sm">{addon.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            LKR {addon.price.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">per booking</div>
        </div>
      </div>
    </div>
  );
};

const AddonSelection: React.FC<AddonSelectionProps> = ({
  selectedAddonIds,
  onAddonSelectionChange,
  onNext,
  onBack,
  basePrice
}) => {
  const { addons, loading, error } = useActiveAddons();
  const [selectedAddons, setSelectedAddons] = useState<string[]>(selectedAddonIds);

  useEffect(() => {
    setSelectedAddons(selectedAddonIds);
  }, [selectedAddonIds]);

  const handleAddonToggle = (addonId: string) => {
    const newSelection = selectedAddons.includes(addonId)
      ? selectedAddons.filter(id => id !== addonId)
      : [...selectedAddons, addonId];
    
    setSelectedAddons(newSelection);
    onAddonSelectionChange(newSelection);
  };

  const calculateTotalPrice = () => {
    const addonTotal = addons
      .filter(addon => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
    
    return basePrice + addonTotal;
  };

  const selectedAddonsTotal = addons
    .filter(addon => selectedAddons.includes(addon.id))
    .reduce((sum, addon) => sum + addon.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading addons...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">❌ Error loading addons: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Add-ons</h2>
        <p className="text-gray-600">Choose any additional services for your stay</p>
      </div>

      {/* Addon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {addons.map((addon) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            isSelected={selectedAddons.includes(addon.id)}
            onToggle={() => handleAddonToggle(addon.id)}
          />
        ))}
      </div>

      {addons.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          <p>No add-ons available at the moment.</p>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Price:</span>
            <span className="font-medium">LKR {basePrice.toFixed(2)}</span>
          </div>
          {selectedAddonsTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Add-ons:</span>
              <span className="font-medium">LKR {selectedAddonsTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-blue-600">LKR {calculateTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Addons List */}
      {selectedAddons.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Add-ons:</h3>
          <div className="space-y-2">
            {addons
              .filter(addon => selectedAddons.includes(addon.id))
              .map(addon => (
                <div key={addon.id} className="flex justify-between items-center bg-blue-50 p-3 rounded">
                  <span className="font-medium">{addon.name}</span>
                  <span className="text-blue-600 font-semibold">LKR {addon.price.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to Details
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue to Confirmation →
        </button>
      </div>
    </div>
  );
};

export default AddonSelection;
