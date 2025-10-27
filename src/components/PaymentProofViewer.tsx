import { useState, useEffect } from 'react';
import { X, Download, Eye, AlertCircle, FileImage } from 'lucide-react';
import { PaymentProofApiService } from '../lib/api/paymentProofApi';

interface PaymentProofViewerProps {
  bookingReferenceId: string;
  onClose: () => void;
}

interface PaymentProofDetails {
  id: string;
  bookingId: string;
  fileUrl: string;
  fileName: string;
  originalFileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentProofViewer({ 
  bookingReferenceId, 
  onClose 
}: PaymentProofViewerProps) {
  const [paymentProof, setPaymentProof] = useState<PaymentProofDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    loadPaymentProof();
  }, [bookingReferenceId]);

  const loadPaymentProof = async () => {
    try {
      setLoading(true);
      setError('');
      
      const details = await PaymentProofApiService.getPaymentProofByReferenceId(bookingReferenceId);
      setPaymentProof(details);
      
      // Download the file to display it
      const blob = await PaymentProofApiService.downloadPaymentProofByReferenceId(bookingReferenceId);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      
    } catch (error) {
      console.error('Failed to load payment proof:', error);
      setError('Failed to load payment proof. It may not exist or there was an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!paymentProof) return;
    
    try {
      const blob = await PaymentProofApiService.downloadPaymentProofByReferenceId(bookingReferenceId);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = paymentProof.originalFileName || paymentProof.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download payment proof:', error);
      setError('Failed to download payment proof');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImageFile = (fileType: string) => {
    return fileType?.startsWith('image/');
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Payment Proof Viewer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment proof...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Payment Proof</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadPaymentProof}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : paymentProof ? (
            <div className="p-6">
              {/* Payment Proof Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Proof Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Booking Reference:</span>
                    <p className="text-gray-900 font-mono">{bookingReferenceId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">File Name:</span>
                    <p className="text-gray-900">{paymentProof.originalFileName || paymentProof.fileName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">File Size:</span>
                    <p className="text-gray-900">{paymentProof.fileSize ? formatFileSize(paymentProof.fileSize) : 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">File Type:</span>
                    <p className="text-gray-900">{paymentProof.fileType || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Uploaded At:</span>
                    <p className="text-gray-900">{formatDate(paymentProof.uploadedAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created At:</span>
                    <p className="text-gray-900">{formatDate(paymentProof.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={loadPaymentProof}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* File Display */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Payment Proof Preview</h4>
                </div>
                <div className="p-4 bg-white">
                  {isImageFile(paymentProof.fileType || '') ? (
                    <img
                      src={imageUrl}
                      alt="Payment Proof"
                      className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-lg"
                      onError={() => setError('Failed to load image preview')}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">File Preview Not Available</h4>
                      <p className="text-gray-600 mb-4">
                        This file type ({paymentProof.fileType}) cannot be previewed in the browser.
                      </p>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Download to View
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Proof Found</h3>
              <p className="text-gray-600">No payment proof has been uploaded for this booking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
