import { apiClient } from '../api';

// Payment Proof API Types
export interface PaymentProofResponse {
  referenceId: string;
  customerName: string;
  customerEmail: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  formattedFileSize: string;
}

export class PaymentProofApiService {
  /**
   * Upload payment proof for a booking
   */
  static async uploadPaymentProof(referenceId: string, file: File): Promise<PaymentProofResponse> {
    const formData = new FormData();
    formData.append('referenceId', referenceId);
    formData.append('file', file);

    return apiClient.post<PaymentProofResponse>('/payment-proofs', formData);
  }

  /**
   * Update payment proof for a booking
   */
  static async updatePaymentProof(referenceId: string, file: File): Promise<PaymentProofResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.put<PaymentProofResponse>(`/payment-proofs/${referenceId}`, formData);
  }

  /**
   * Get payment proof by reference ID
   */
  static async getPaymentProofByReferenceId(referenceId: string): Promise<PaymentProofResponse> {
    return apiClient.get<PaymentProofResponse>(`/payment-proofs/${referenceId}`);
  }

  /**
   * Check if payment proof exists for a booking
   */
  static async hasPaymentProof(referenceId: string): Promise<boolean> {
    return apiClient.get<boolean>(`/payment-proofs/${referenceId}/exists`);
  }

  /**
   * Delete payment proof by reference ID
   */
  static async deletePaymentProofByReferenceId(referenceId: string): Promise<void> {
    return apiClient.delete<void>(`/payment-proofs/${referenceId}`);
  }

  /**
   * Download payment proof by reference ID
   */
  static async downloadPaymentProofByReferenceId(referenceId: string): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/payment-proofs/${referenceId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download payment proof: ${response.statusText}`);
    }

    return response.blob();
  }
}