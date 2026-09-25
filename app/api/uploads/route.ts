import { NextResponse } from 'next/server';
import { q, ensureUploadsTable } from '@/lib/db';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

function getUploadsDir(): string {
  const dir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function resolveMimeType(name: string, fallback: string): string {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv; charset=utf-8',
    txt: 'text/plain; charset=utf-8',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
    dwg: 'application/acad',
    dxf: 'application/dxf',
  };
  return map[ext] || fallback || 'application/octet-stream';
}

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// GET /api/uploads — list all files
export async function GET() {
  await ensureUploadsTable();
  try {
    const res = await q(
      `SELECT id, filename, original_name, mime_type, size_bytes, created_at
       FROM uploads
       ORDER BY created_at DESC`
    );
    const files = res.rows.map((r) => ({
      ...r,
      url: `/api/uploads/${encodeURIComponent(r.filename)}`,
    }));
    return NextResponse.json({ files });
  } catch (err) {
    console.error('Failed to list uploads:', err);
    return NextResponse.json({ files: [] });
  }
}

// POST /api/uploads — upload image or document
export async function POST(req: Request) {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  await ensureUploadsTable();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }

    const originalName = file.name || 'document.bin';

    // Disallow dangerous executable scripts and files
    if (/\.(exe|bat|cmd|sh|bin|com|msi|dll|vbs|pif|scr)$/i.test(originalName)) {
      return NextResponse.json({ error: 'Загрузка исполняемых файлов (.exe, .bat, .sh) запрещена в целях безопасности' }, { status: 400 });
    }

    // Size limit: 50MB
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Файл слишком большой (максимальный размер 50 МБ)' }, { status: 400 });
    }

    const mimeType = resolveMimeType(originalName, file.type || 'application/octet-stream');

    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'dat';
    const baseSlug = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '_')
      .slice(0, 50);

    const filename = `${Date.now()}_${baseSlug}.${ext}`;

    // 1. Save directly into single folder on server: public/uploads (cached to disk)
    try {
      const uploadsDir = getUploadsDir();
      const diskPath = path.join(uploadsDir, filename);
      fs.writeFileSync(diskPath, buffer);
    } catch (diskErr) {
      console.warn('Could not write upload to disk cache, will rely on DB storage:', diskErr);
    }

    // 2. Save metadata and backup in PostgreSQL
    const res = await q(
      `INSERT INTO uploads (filename, original_name, mime_type, size_bytes, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, filename, original_name, mime_type, size_bytes, created_at`,
      [filename, originalName, mimeType, buffer.length, buffer]
    );

    const item = res.rows[0];
    return NextResponse.json({
      ok: true,
      file: {
        ...item,
        url: `/api/uploads/${encodeURIComponent(item.filename)}`,
      },
    });
  } catch (ex) {
    console.error('Upload error:', ex);
    return NextResponse.json(
      { error: ex instanceof Error ? ex.message : 'Ошибка загрузки файла' },
      { status: 500 }
    );
  }
}
