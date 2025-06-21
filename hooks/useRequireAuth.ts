'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requiredRole?: 'admin' | 'exchange';
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { redirectTo = '/login', requiredRole } = options;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        // User doesn't have required role
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'exchange') {
          router.push('/exchange');
        } else {
          router.push('/login');
        }
        return;
      }
    }
  }, [user, loading, router, redirectTo, requiredRole]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasRequiredRole: !requiredRole || (user?.role === requiredRole),
  };
} 