import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil',
    });

    // Clear auth cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (err: any) {
    console.error('[Member Logout Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Logout gagal' }, 
      { status: 500 }
    );
  }
}
