import { Redirect, Stack } from 'expo-router';

import { Loading } from '@/components/common/Loading';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return <Loading label="Checking session" />;
  if (user) return <Redirect href="/dashboard" />;

  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}

