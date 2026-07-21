import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const maxDuration = 60;

// Parse CLOUDINARY_URL manual karena Next.js kadang tidak auto-parse
const cloudinaryUrl = process.env.CLOUDINARY_URL || '';
const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
if (match) {
  cloudinary.config({
    api_key: match[1],
    api_secret: match[2],
    cloud_name: match[3],
  });
}

function uploadToCloudinary(buffer: Buffer, mimetype: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'iai-muda-jakarta',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        timeout: 120000, // 2 menit timeout
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Only image files are allowed!' }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Ukuran file maksimal 20MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, file.type);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.name,
      size: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (err: any) {
    console.error('[Upload Error]', err);
    return NextResponse.json({ success: false, message: err.message || 'File upload failed' }, { status: 500 });
  }
}
