import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { subscribeToAuthState } from '@/firebase/auth';
import { getUserProfile } from '@/services/authService';
import { AppUserProfile } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const nextProfile = await getUserProfile(currentUser.uid);
          setProfile(nextProfile);
          setError(nextProfile ? '' : 'Your user profile could not be found. Please contact an administrator.');
        } catch (profileError) {
          setProfile(null);
          setError('Unable to load your user profile. Check your connection and try again.');
          console.error('Profile load error:', profileError);
        }
      } else {
        setProfile(null);
        setError('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading, error };
};
