import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: 'Nama, email, dan pesan wajib diisi.' }, { status: 400 });
    }
    if (name.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Nama terlalu pendek (minimal 2 karakter).' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Format email tidak valid.' }, { status: 400 });
    }
    if (message.trim().length < 10) {
      return NextResponse.json({ success: false, message: 'Pesan terlalu pendek (minimal 10 karakter).' }, { status: 400 });
    }

    await db.insert(schema.contactMessages).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    return NextResponse.json({ success: true, message: 'Pesan Anda berhasil terkirim. Kami akan menghubungi Anda dalam 1x24 jam kerja.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Gagal mengirim pesan.' }, { status: 500 });
  }
}
