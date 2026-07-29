'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/src/components/LoginPage';
import { useAuth } from '@/src/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/admin');
    }
  }, [user, loading, router]);

  const handleSuccess = () => {
    // Force full page navigation so browser sends new auth cookie to server
    window.location.href = '/admin';
  };

  return <LoginPage onSuccess={handleSuccess} />;
}
