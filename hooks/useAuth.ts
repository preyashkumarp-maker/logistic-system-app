import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { subscribeToAuthState } from '@/firebase/auth';
import { getUserProfile } from '@/services/authService';
import { AppUserProfile } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const nextProfile = await getUserProfile(currentUser.uid);
        setProfile(nextProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
};
