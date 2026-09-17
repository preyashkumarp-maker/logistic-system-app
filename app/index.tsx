import { Redirect } from 'expo-router';

import { Loading } from '@/components/common/Loading';
import { useAuth } from '@/hooks/useAuth';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading label="Checking session" />;
  }

  return user ? <Redirect href="/dashboard" /> : <Redirect href="/login" />;
}
