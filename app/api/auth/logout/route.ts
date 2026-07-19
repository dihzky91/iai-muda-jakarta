import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set('auth_token', '', { httpOnly: true, maxAge: 0 });
  return response;
}
