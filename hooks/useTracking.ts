import { useEffect, useState } from 'react';

import { listenToTrackingLocation } from '@/services/trackingService';
import { ParcelLocation } from '@/types/parcel';

export const useTracking = (parcelId?: string) => {
  const [location, setLocation] = useState<ParcelLocation | null>(null);
  const [loading, setLoading] = useState(Boolean(parcelId));

  useEffect(() => {
    if (!parcelId) {
      setLocation(null);
      setLoading(false);
      return;
    }

    const unsubscribe = listenToTrackingLocation(parcelId, (nextLocation) => {
      setLocation(nextLocation);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [parcelId]);

  return { location, loading };
};
