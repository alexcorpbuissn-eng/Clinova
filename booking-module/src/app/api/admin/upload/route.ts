import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 });
    }

    // Validate file size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fayl hajmi 5 MB dan oshmasligi kerak' }, { status: 400 });
    }

    // Whitelist allowed image types only
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WEBP, GIF)' }, { status: 400 });
    }

    // Derive extension from MIME type — never trust the filename extension from client
    const MIME_TO_EXT: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = MIME_TO_EXT[file.type];

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename (extension comes from server-side MIME map, not client)
    const filename = `${uuidv4()}.${ext}`;
    
    // Save to public/uploads
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Create directory if it doesn't exist
    try {
      const { mkdir } = require('fs/promises');
      await mkdir(uploadDir, { recursive: true });
    } catch(e) {}

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Fayl yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}
