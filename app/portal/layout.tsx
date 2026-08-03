'use client';

import { MemberAuthProvider } from '@/src/context/MemberAuthContext';
import ProfAkunWidget from '@/src/components/ProfAkunWidget';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MemberAuthProvider>
      {children}
      <ProfAkunWidget />
    </MemberAuthProvider>
  );
}

