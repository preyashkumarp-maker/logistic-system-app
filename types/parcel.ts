export type ParcelStatus =
  | 'CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ParcelLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: string | Date;
}

export interface Parcel {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  packageWeight: string;
  status: ParcelStatus;
  driverId?: string;
  currentLocation?: ParcelLocation;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  estimatedDeliveryDate?: string | Date;
}

export interface ParcelTrackingEvent {
  status: ParcelStatus;
  latitude?: number;
  longitude?: number;
  timestamp?: string | Date;
  updatedBy?: string;
}
