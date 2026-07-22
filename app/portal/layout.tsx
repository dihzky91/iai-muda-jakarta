'use client';

import { MemberAuthProvider } from '@/src/context/MemberAuthContext';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MemberAuthProvider>
      {children}
    </MemberAuthProvider>
  );
}
