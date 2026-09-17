export type TrackingStatus = 'active' | 'completed' | 'idle';

export interface TrackingData {
  parcelId: string;
  driverId?: string;
  status: TrackingStatus;
  latitude: number;
  longitude: number;
  updatedAt?: string | Date;
}
