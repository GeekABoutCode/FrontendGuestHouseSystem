import { useState, useEffect } from 'react';
import { AddonApiService, AddonResponse } from '../lib/api/addonApi';
import { Addon } from '../types';

// Hook for fetching all addons
export function useAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddons = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const backendAddons = await AddonApiService.getAllAddons();
      // Handle case when backend returns no content (empty addons)
      const addonsArray = Array.isArray(backendAddons) ? backendAddons : [];
      const transformedAddons = addonsArray.map(transformAddonFromBackend);
      setAddons(transformedAddons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  return { addons, loading, error, refetch: fetchAddons };
}

// Hook for fetching active addons only
export function useActiveAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveAddons = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const backendAddons = await AddonApiService.getActiveAddons();
      // Handle case when backend returns no content (empty addons)
      const addonsArray = Array.isArray(backendAddons) ? backendAddons : [];
      const transformedAddons = addonsArray.map(transformAddonFromBackend);
      setAddons(transformedAddons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active addons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAddons();
  }, []);

  return { addons, loading, error, refetch: fetchActiveAddons };
}

// Transform backend addon response to frontend addon
function transformAddonFromBackend(backendAddon: AddonResponse): Addon {
  return {
    id: backendAddon.id,
    name: backendAddon.name,
    description: backendAddon.description,
    price: backendAddon.price,
    active: backendAddon.active,
    createdAt: backendAddon.createdAt,
    updatedAt: backendAddon.updatedAt
  };
}
