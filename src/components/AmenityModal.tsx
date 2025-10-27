import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface AmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amenityData: { name: string; description?: string; iconUrl?: string; isActive?: boolean }) => Promise<void>;
  amenity?: {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    isActive: boolean;
  } | null;
  loading?: boolean;
}

export default function AmenityModal({ isOpen, onClose, onSave, amenity, loading = false }: AmenityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (amenity) {
      setFormData({
        name: amenity.name,
        description: amenity.description || '',
        iconUrl: amenity.iconUrl || '',
        isActive: amenity.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        iconUrl: '',
        isActive: true
      });
    }
    setErrors({});
  }, [amenity, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        iconUrl: formData.iconUrl.trim() || undefined,
        isActive: formData.isActive
      });
      onClose();
    } catch (error) {
      console.error('Error saving amenity:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {amenity ? 'Edit Amenity' : 'Add New Amenity'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter amenity name"
              disabled={loading}
            />
            {errors.name && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amenity description"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="iconUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Icon URL
            </label>
            <input
              type="url"
              id="iconUrl"
              value={formData.iconUrl}
              onChange={(e) => handleInputChange('iconUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter icon URL (optional)"
              disabled={loading}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {amenity ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
