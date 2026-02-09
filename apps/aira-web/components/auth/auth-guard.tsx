'use client';

const isDev = process.env.NODE_ENV === 'development';



import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useIsAuthLoading, useUser } from '@repo/core';
import { ROUTES } from '@/lib/constants';

interface AuthGuardProps {
  children: React.ReactNode;
  requireActive?: boolean;
}

export function AuthGuard({ children, requireActive = true }: AuthGuardProps) {
  if (isDev) {
    return <>{children}</>;
  }
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsAuthLoading();
  const { data: user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    // Wait for auth state to load
    if (isLoading) return;

    // Redirect to signin if not authenticated
    if (!isAuthenticated && !isDev) {             //  Skip auth in development

      router.replace(ROUTES.SIGNIN);
      return;
    }

    // If we require active user, check user status
    if (requireActive && !isUserLoading && user && !user.is_active &&   //for removing Oauth in local
      !isDev) {
      router.replace(ROUTES.PHONE);
    }
  }, [isAuthenticated, isLoading, user, isUserLoading, requireActive, router]);

  // Show nothing while checking auth
  // if (isLoading || (!isAuthenticated && !isLoading)) {

  if (isLoading && !isDev) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  // Show loading while checking user status
  if (requireActive && isUserLoading && !isDev) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
