import { redirect } from 'next/navigation';

export default function KalenderPage() {
  redirect('/acara?view=calendar');
}
