// File upload utility functions
export interface UploadResponse {
  success: boolean;
  url?: string;
  urls?: string[];
  error?: string;
}

// Real implementation for backend upload
export async function uploadFile(file: File, propertyId?: string, roomId?: string): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (propertyId) {
      formData.append('propertyId', propertyId);
    }
    if (roomId) {
      formData.append('roomId', roomId);
    }

    const token = localStorage.getItem('auth_token');
    const apiBaseUrl = 'http://localhost:8080'; // Hardcoded since env var is undefined
    console.log('🔑 Auth token:', token ? 'Present' : 'Missing');
    console.log('📤 Uploading to:', `${apiBaseUrl}/api/photos/upload`);

    const response = await fetch(`${apiBaseUrl}/api/photos/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}

export async function uploadMultipleFiles(files: File[], propertyId?: string, roomId?: string): Promise<UploadResponse> {
  try {
    const uploadPromises = files.map(file => uploadFile(file, propertyId, roomId));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);
    
    if (failedUploads.length > 0) {
      return {
        success: false,
        error: `${failedUploads.length} file(s) failed to upload`
      };
    }
    
    return {
      success: true,
      urls: successfulUploads.map(result => result.url!).filter(Boolean)
    };
  } catch (error) {
    console.error('Multiple upload error:', error);
    return {
      success: false,
      error: 'Failed to upload files'
    };
  }
}

// Real implementation example for your backend:
/*
export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Replace with your actual backend endpoint
    const response = await fetch('http://your-backend-url/api/upload', {
      method: 'POST',
      body: formData,
      // Add authentication headers if needed
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return {
      success: true,
      url: data.url // Your backend should return the URL of the uploaded file
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload file'
    };
  }
}

// For multiple files:
export async function uploadMultipleFiles(files: File[]): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    const response = await fetch('http://your-backend-url/api/upload-multiple', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return {
      success: true,
      urls: data.urls // Your backend should return an array of URLs
    };
  } catch (error) {
    console.error('Multiple upload error:', error);
    return {
      success: false,
      error: 'Failed to upload files'
    };
  }
}*/

