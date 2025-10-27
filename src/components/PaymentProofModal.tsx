import { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { usePaymentProofOperations } from '../hooks/usePaymentProof';
import { usePaymentProof } from '../hooks/usePaymentProof';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  onSuccess?: () => void;
}

export default function PaymentProofModal({ isOpen, onClose, referenceId, onSuccess }: PaymentProofModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loading, error, uploadPaymentProof, updatePaymentProof, deletePaymentProof, downloadPaymentProof } = usePaymentProofOperations();
  const { paymentProof, hasProof, loading: paymentProofLoading, refetch: refetchPaymentProof } = usePaymentProof(referenceId);

  // Refetch payment proof when modal opens
  useEffect(() => {
    if (isOpen) {
      refetchPaymentProof();
    }
  }, [isOpen, refetchPaymentProof]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      if (hasProof) {
        // Update existing payment proof
        await updatePaymentProof(referenceId, selectedFile);
      } else {
        // Upload new payment proof
        await uploadPaymentProof(referenceId, selectedFile);
      }
      
      setUploadSuccess(true);
      setSelectedFile(null);
      refetchPaymentProof();
      onSuccess?.();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePaymentProof(referenceId);
      refetchPaymentProof();
      onSuccess?.();
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadPaymentProof(referenceId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payment Proof</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {uploadSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Payment proof uploaded successfully!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Existing Payment Proof Section */}
          {paymentProofLoading ? (
            <div className="mb-4 bg-gray-50 rounded-lg p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading payment proof...</p>
            </div>
          ) : hasProof && paymentProof ? (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-900">Current Payment Proof</p>
                    <p className="text-sm text-green-700">
                      {paymentProof.fileName} • {paymentProof.formattedFileSize}
                    </p>
                    <p className="text-xs text-green-600">
                      Uploaded: {new Date(paymentProof.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDownload}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {hasProof ? 'Update Payment Proof' : 'Upload Payment Proof'}
              </label>
              
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Drag and drop your payment proof here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: JPEG, PNG, PDF, WebP, GIF (max 5MB)
                    </p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,application/pdf,image/webp,image/gif"
                className="hidden"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {hasProof ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {hasProof ? 'Update' : 'Upload'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Payment Proof</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this payment proof? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}