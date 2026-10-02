'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { useAuthStore } from '@/store/useAuthStore';
import { useVaultStore } from '@/store/useVaultStore';

export const AuthListener: React.FC = () => {
  const { setUser, logout } = useAuthStore();
  const { clearProfiles } = useVaultStore();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    try {
      const supabase = createClient();

      // Check current session on mount
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'Valued Customer',
            email: session.user.email,
            phone: session.user.phone || '',
          });
        }
      });

      // Listen for auth state changes (sign in, sign out, token refresh)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'Valued Customer',
            email: session.user.email,
            phone: session.user.phone || '',
          });
        } else if (event === 'SIGNED_OUT') {
          logout();
          clearProfiles();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('AuthListener error:', err);
    }
  }, [setUser, logout, clearProfiles]);

  return null;
};
