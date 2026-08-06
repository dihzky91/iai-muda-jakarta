import React from 'react';
import MemberLayout from '@/src/components/member/MemberLayout';
import HallOfFameView from '@/src/components/member/HallOfFameView';

export const metadata = {
  title: 'Hall of Fame & History Timeline — IAI Muda Wilayah DKI Jakarta',
  description: 'Museum digital dan rekam jejak perjalanan sejarah, proker akbar, serta jajaran pimpinan demisioner IAI Muda DKI Jakarta.',
};

export default function HallOfFamePage() {
  return (
    <MemberLayout>
      <HallOfFameView />
    </MemberLayout>
  );
}
