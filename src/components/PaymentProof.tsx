import React, { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle, CreditCard, Calendar, User, MapPin } from 'lucide-react';
import { Booking } from '../types';
import { useApp } from '../context/AppContextWithApi';

interface PaymentProofProps {
  booking: Booking;
  onBack: () => void;
}

export default function PaymentProof({ booking, onBack }: PaymentProofProps) {
  const { dispatch } = useApp();
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

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
      setPaymentProof(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!paymentProof) return;

    setUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update booking with payment proof
    dispatch({
      type: 'UPDATE_BOOKING',
      payload: {
        id: booking.id,
        updates: {
          paymentProof: URL.createObjectURL(paymentProof),
          status: 'pending'
        }
      }
    });

    setUploading(false);
    setUploaded(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (uploaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Proof Uploaded!</h2>
          <p className="text-gray-600 mb-6">
            Your payment proof has been successfully uploaded. We'll review it and confirm your booking within 24 hours.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Booking Reference</div>
            <div className="font-mono text-lg font-bold text-gray-900">{booking.referenceId}</div>
          </div>
          <button
            onClick={onBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
        
        <button
          onClick={onBack}
          className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Skip for Now - Upload Later
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Upload Payment Proof</h1>
                <p className="text-blue-100">Complete your booking by uploading payment confirmation</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Booking Reference</div>
                <div className="font-mono text-xl font-bold">{booking.referenceId}</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{booking.propertyName}</div>
                      <div className="text-sm text-gray-600">Property</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{booking.guestName}</div>
                      <div className="text-sm text-gray-600">{booking.guestEmail}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                      </div>
                      <div className="text-sm text-gray-600">{calculateNights()} nights • {booking.guests} guests</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">${booking.totalAmount}</div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>

                  {booking.selectedAmenities.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Selected Amenities</div>
                      <div className="flex flex-wrap gap-2">
                        {booking.selectedAmenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Upload */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Proof</h2>
                
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-blue-900 mb-2">Payment Instructions</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• Transfer the total amount to our bank account</p>
                      <p>• Account: GuestHousePro - 1234567890</p>
                      <p>• Include your booking reference in the transfer note</p>
                      <p>• Upload a screenshot or photo of the transfer confirmation</p>
                    </div>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : paymentProof
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {paymentProof ? (
                      <div>
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-green-700 font-medium mb-2">File Selected</p>
                        <p className="text-sm text-gray-600">{paymentProof.name}</p>
                        <button
                          onClick={() => setPaymentProof(null)}
                          className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                        >
                          Choose different file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Drag and drop your payment proof here, or{' '}
                          <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            browse files
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={handleFileChange}
                            />
                          </label>
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports: JPG, PNG, PDF (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!paymentProof || uploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Payment Proof
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}