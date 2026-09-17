export const PARCEL_STATUS_COLORS: Record<string, string> = {
  CREATED: '#64748b',
  PICKED_UP: '#3b82f6',
  IN_TRANSIT: '#f59e0b',
  OUT_FOR_DELIVERY: '#8b5cf6',
  DELIVERED: '#16a34a',
  CANCELLED: '#ef4444',
};

export const PARCEL_STATUSES = [
  'CREATED',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const;

export const DRIVER_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#16a34a',
  ON_DELIVERY: '#f59e0b',
  OFFLINE: '#64748b',
};

export const DRIVER_STATUSES = ['AVAILABLE', 'ON_DELIVERY', 'OFFLINE'] as const;
