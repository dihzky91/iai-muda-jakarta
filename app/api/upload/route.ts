import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { adminRoute, fail } from '@/lib/api';

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

function uploadToCloudinary(buffer: Buffer, mimetype: string, originalName: string): Promise<any> {
  const isImage = mimetype.startsWith('image/');
  const isPdf = mimetype === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
  // For images and PDFs, Cloudinary image resource type provides optimization & preview capabilities
  const resourceType = isImage || isPdf ? 'auto' : 'raw';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'iai-muda-jakarta',
        resource_type: resourceType,
        ...(isImage ? { transformation: [{ quality: 'auto', fetch_format: 'auto' }] } : {}),
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

export const POST = adminRoute(['superadmin', 'admin', 'editor'], async (request) => {
  const formData = await request.formData();
  const file = (formData.get('file') || formData.get('image')) as File | null;

  if (!file) {
    return fail('No file uploaded', 400);
  }

  if (file.size > 50 * 1024 * 1024) {
    return fail('Ukuran file maksimal 50MB', 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadToCloudinary(buffer, file.type, file.name);

  return NextResponse.json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
    originalName: file.name,
    size: file.size || result.bytes,
    fileType: file.name.split('.').pop()?.toLowerCase() || '',
  });
}, 'File upload failed');

