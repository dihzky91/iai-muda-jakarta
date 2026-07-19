'use client';
import { useRouter } from 'next/navigation';
import LoginPage from '@/src/components/LoginPage';

export default function AdminLoginPage() {
  const router = useRouter();
  return <LoginPage onSuccess={() => router.push('/admin')} />;
}
