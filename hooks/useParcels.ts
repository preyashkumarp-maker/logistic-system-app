import { useEffect, useState } from 'react';

import { listenToParcels } from '@/services/parcelService';
import { Parcel } from '@/types/parcel';

export const useParcels = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToParcels((items) => {
      setParcels(items);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return { parcels, loading, error };
};
