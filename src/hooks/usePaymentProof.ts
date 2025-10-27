import { useState, useEffect } from 'react';
import { PaymentProofApiService, PaymentProofResponse } from '../lib/api/paymentProofApi';

// Hook for payment proof management
export function usePaymentProof(referenceId: string) {
  const [paymentProof, setPaymentProof] = useState<PaymentProofResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProof, setHasProof] = useState<boolean>(false);

  const fetchPaymentProof = async () => {
    if (!referenceId) return;

    setLoading(true);
    setError(null);

    try {
      // First check if payment proof exists
      const exists = await PaymentProofApiService.hasPaymentProof(referenceId);
      setHasProof(exists);

      if (exists) {
        // If it exists, fetch the details
        const proof = await PaymentProofApiService.getPaymentProofByReferenceId(referenceId);
        setPaymentProof(proof);
      } else {
        setPaymentProof(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment proof');
      setHasProof(false);
      setPaymentProof(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentProof();
  }, [referenceId]);

  return { 
    paymentProof, 
    hasProof, 
    loading, 
    error, 
    refetch: fetchPaymentProof 
  };
}

// Hook for payment proof operations
export function usePaymentProofOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPaymentProof = async (referenceId: string, file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Validate file
      if (!file) {
        throw new Error('Please select a file to upload');
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload JPEG, PNG, PDF, WebP, or GIF files only');
      }

      const result = await PaymentProofApiService.uploadPaymentProof(referenceId, file);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload payment proof';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentProof = async (referenceId: string, file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Validate file
      if (!file) {
        throw new Error('Please select a file to upload');
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload JPEG, PNG, PDF, WebP, or GIF files only');
      }

      const result = await PaymentProofApiService.updatePaymentProof(referenceId, file);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment proof';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentProof = async (referenceId: string) => {
    setLoading(true);
    setError(null);

    try {
      await PaymentProofApiService.deletePaymentProofByReferenceId(referenceId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment proof';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadPaymentProof = async (referenceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const blob = await PaymentProofApiService.downloadPaymentProofByReferenceId(referenceId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment_proof_${referenceId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download payment proof';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadPaymentProof,
    updatePaymentProof,
    deletePaymentProof,
    downloadPaymentProof
  };
}






