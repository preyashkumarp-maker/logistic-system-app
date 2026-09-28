import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { listenToParcels } from '@/services/parcelService';
import { Parcel } from '@/types/parcel';

export const useParcels = () => {
  const { user, profile } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !profile) return undefined;

    const unsubscribe = listenToParcels(profile.role, user.uid, (items) => {
      setParcels(items);
      setLoading(false);
      setError(null);
    }, (listenerError) => {
      setLoading(false);
      setError('Unable to load parcels. Check your connection and try again.');
      console.error(listenerError);
    });

    return () => unsubscribe();
  }, [profile, user]);

  return { parcels, loading, error };
};
