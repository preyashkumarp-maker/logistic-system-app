import { ParcelLocation } from '@/types/parcel';

export const generateTrackingNumber = () => {
  const prefix = 'TRK';
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${rand}`;
};

export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c * 1000;
};

export const formatLocation = (location?: ParcelLocation | null) => {
  if (!location) return 'Not available';
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
};
