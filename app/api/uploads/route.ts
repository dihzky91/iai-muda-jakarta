import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadDir);
    const fileList = await Promise.all(
      files.map(async (file) => {
        const stats = await stat(path.join(uploadDir, file));
        return {
          name: file,
          url: `/uploads/${file}`,
          time: stats.mtime.getTime(),
        };
      })
    );
    fileList.sort((a, b) => b.time - a.time);

    return NextResponse.json({ success: true, files: fileList });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to list uploads' }, { status: 500 });
  }
}
