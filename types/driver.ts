export type DriverStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string;
  vehicleType: string;
  status: DriverStatus;
  currentLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    timestamp?: string | Date;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
