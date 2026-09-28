import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { listenToDrivers } from '@/services/driverService';
import { Driver } from '@/types/driver';

export const useDrivers = () => {
  const { user, profile } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return undefined;
    if (profile.role === 'user') {
      setDrivers([]);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = listenToDrivers(profile.role, user.uid, (items) => {
      setDrivers(items);
      setLoading(false);
    }, (listenerError) => {
      setLoading(false);
      console.error('Unable to load drivers:', listenerError);
    });

    return () => unsubscribe();
  }, [profile, user]);

  return { drivers, loading };
};
