import { useState, useEffect, useCallback } from 'react';
import { AdminUserApiService, AdminUserResponse, AdminUserRequest, AdminUserUpdateRequest } from '../lib/api/adminUserApi';
import { useApiWithNotifications } from './useApi';

export function useAdminUsers() {
  const [adminUsers, setAdminUsers] = useState<AdminUserResponse[]>([]);
  const { loading, error, execute, clearNotifications } = useApiWithNotifications();

  const refetch = useCallback(async () => {
    console.log('🔄 Fetching admin users...');
    console.log('🔑 Auth token:', localStorage.getItem('auth_token'));
    console.log('🔑 Admin token:', localStorage.getItem('admin_token'));
    try {
      const data = await execute(() => AdminUserApiService.getAllAdminUsers());
      console.log('✅ Admin users fetched:', data);
      if (data) {
        setAdminUsers(data);
      }
    } catch (error) {
      console.error('❌ Error fetching admin users:', error);
    }
  }, [execute]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { adminUsers, loading, error, refetch, clearNotifications };
}

export function useAdminUserManagement() {
  const { loading, error, success, execute, clearNotifications } = useApiWithNotifications();

  const createAdminUser = useCallback(async (adminData: AdminUserRequest) => {
    return execute(() => AdminUserApiService.createAdminUser(adminData));
  }, [execute]);

  const updateAdminUser = useCallback(async (id: string, updateData: AdminUserUpdateRequest) => {
    return execute(() => AdminUserApiService.updateAdminUser(id, updateData));
  }, [execute]);

  const deleteAdminUser = useCallback(async (id: string) => {
    return execute(() => AdminUserApiService.deleteAdminUser(id));
  }, [execute]);

  return { createAdminUser, updateAdminUser, deleteAdminUser, loading, error, success, clearNotifications };
}
