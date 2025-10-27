import { useState, useEffect } from 'react';
import { X, Download, AlertCircle } from 'lucide-react';

interface SimplePaymentProofViewerProps {
  bookingReferenceId: string;
  onClose: () => void;
}

export default function SimplePaymentProofViewer({ 
  bookingReferenceId, 
  onClose 
}: SimplePaymentProofViewerProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Common filename patterns to try
  const patterns = [
    `payment_proof_${bookingReferenceId}.jpg`,
    `payment_proof_${bookingReferenceId}.jpeg`,
    `payment_proof_${bookingReferenceId}.png`,
    `${bookingReferenceId}.jpg`,
    `${bookingReferenceId}.jpeg`,
    `${bookingReferenceId}.png`,
    `payment_${bookingReferenceId}.jpg`,
    `proof_${bookingReferenceId}.jpg`,
  ];

  useEffect(() => {
    const findPaymentProof = () => {
      setLoading(true);
      setImageError(false);

      let currentPatternIndex = 0;

      const tryNextPattern = () => {
        if (currentPatternIndex >= patterns.length) {
          setImageError(true);
          setLoading(false);
          return;
        }

        const pattern = patterns[currentPatternIndex];
        const testUrl = `http://localhost:8080/uploads/payment_proof/${bookingReferenceId}/${pattern}`;
        
        const img = new Image();
        img.onload = () => {
          setImageUrl(testUrl);
          setLoading(false);
        };
        img.onerror = () => {
          currentPatternIndex++;
          tryNextPattern();
        };
        img.src = testUrl;
      };

      tryNextPattern();
    };

    findPaymentProof();
  }, [bookingReferenceId]);

  const handleImageError = () => {
    setImageError(true);
    setLoading(false);
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `payment_proof_${bookingReferenceId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Payment Proof - {bookingReferenceId}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Looking for payment proof...</p>
              </div>
            ) : imageError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Payment Proof Found</h4>
                <p className="text-gray-600 mb-4">
                  No payment proof has been uploaded for booking reference: <strong>{bookingReferenceId}</strong>
                </p>
                <div className="text-sm text-gray-500">
                  <p>Expected location: <code>uploads/payment_proof/{bookingReferenceId}/</code></p>
                  <p className="mt-2">Tried patterns: {patterns.join(', ')}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <img
                  src={imageUrl}
                  alt={`Payment proof for ${bookingReferenceId}`}
                  className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-lg"
                  onError={handleImageError}
                />
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Payment proof for booking: <strong>{bookingReferenceId}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}