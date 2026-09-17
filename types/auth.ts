export type UserRole = 'admin' | 'driver' | 'user';

export interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AuthFormValues {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
}
