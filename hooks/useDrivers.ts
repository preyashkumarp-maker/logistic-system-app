import { useEffect, useState } from 'react';

import { listenToDrivers } from '@/services/driverService';
import { Driver } from '@/types/driver';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToDrivers((items) => {
      setDrivers(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { drivers, loading };
};
