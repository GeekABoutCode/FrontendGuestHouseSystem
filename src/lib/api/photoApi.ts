import { apiClient } from '../api';

// Photo API Types
export interface PhotoDto {
  id: string;
  url: string;
  caption: string;
}

// Photo API Service
export class PhotoApiService {
  // Get all photos for a specific property
  static async getPhotosByProperty(propertyId: string): Promise<PhotoDto[]> {
    return apiClient.get<PhotoDto[]>(`/photos/property/${propertyId}`);
  }

  // Get all photos for a specific room
  static async getPhotosByRoom(roomId: string): Promise<PhotoDto[]> {
    return apiClient.get<PhotoDto[]>(`/photos/room/${roomId}`);
  }

  // Get photo by ID
  static async getPhotoById(photoId: string): Promise<PhotoDto> {
    return apiClient.get<PhotoDto>(`/photos/${photoId}`);
  }

  // Upload photo
  static async uploadPhoto(photoData: { propertyId?: string; roomId?: string; caption?: string }, file: File): Promise<PhotoDto> {
    const formData = new FormData();
    formData.append('file', file);
    if (photoData.propertyId) formData.append('propertyId', photoData.propertyId);
    if (photoData.roomId) formData.append('roomId', photoData.roomId);
    if (photoData.caption) formData.append('caption', photoData.caption);

    return apiClient.post<PhotoDto>('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}
