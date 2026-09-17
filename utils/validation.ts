export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: string) => emailRegex.test(value.trim());

export const validateRequired = (value?: string) => {
  if (!value) return 'This field is required';
  return value.trim().length > 0 ? '' : 'This field is required';
};

export const validatePassword = (value: string) => {
  if (value.length < 6) return 'Password must be at least 6 characters';
  return '';
};

export const validatePhone = (value?: string) => {
  if (!value || !value.trim()) return 'Phone is required';
  return value.replace(/\D/g, '').length >= 10 ? '' : 'Enter a valid phone number';
};

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) return 'Confirm password is required';
  return password === confirmPassword ? '' : 'Passwords do not match';
};
