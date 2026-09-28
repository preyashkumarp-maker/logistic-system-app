import { UserRole } from '@/types/auth';

export const APP_ROUTES: Record<UserRole, string[]> = {
  admin: ['dashboard', 'parcels', 'drivers', 'users', 'profile'],
  driver: ['dashboard', 'parcels', 'profile'],
  user: ['dashboard', 'parcels', 'profile'],
};

export const canAccessRoute = (role: UserRole | undefined, route: string) => {
  return role ? APP_ROUTES[role].includes(route) : false;
};

export const isAdmin = (role: UserRole | undefined) => role === 'admin';
export const isDriver = (role: UserRole | undefined) => role === 'driver';
export const isCustomer = (role: UserRole | undefined) => role === 'user';