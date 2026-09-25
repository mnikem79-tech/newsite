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

async function adminId(): Promise<number | null> {
  const c = await cookies();
  return parseSessionToken(c.get(SESSION_COOKIE)?.value);
}

// GET /api/uploads/:filename — stream file or trigger download
export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const decoded = decodeURIComponent(filename);
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, decoded);

  const url = new URL(req.url);
  const forceDownload = url.searchParams.get('download') === '1';

  await ensureUploadsTable();

  let fileBuffer: Buffer | null = null;
  let originalName = decoded;
  let mimeType = 'application/octet-stream';

  // 1. Check database for metadata & buffer
  try {
    const res = await q('SELECT original_name, mime_type, data FROM uploads WHERE filename = $1', [decoded]);
    if (res.rows.length) {
      originalName = res.rows[0].original_name || decoded;
      mimeType = res.rows[0].mime_type || mimeType;
      fileBuffer = res.rows[0].data;
    }
  } catch (err) {
    console.error('Error fetching file record:', err);
  }

  // 2. Check disk file in uploads folder
  if (fs.existsSync(filePath)) {
    try {
      fileBuffer = fs.readFileSync(filePath);
    } catch {
      // fallback to buffer from DB
    }
  } else if (fileBuffer) {
    // Write back to disk so the single folder stays populated
    try {
      fs.writeFileSync(filePath, fileBuffer);
    } catch {
      // ignore
    }
  }

  if (!fileBuffer) {
    return new NextResponse('File not found', { status: 404 });
  }

  const isImage = mimeType.startsWith('image/');
  const isInline = !forceDownload && (isImage || mimeType === 'application/pdf');

  const encodedFilename = encodeURIComponent(originalName).replace(/'/g, '%27');
  const dispositionType = isInline ? 'inline' : 'attachment';
  const contentDisposition = `${dispositionType}; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`;

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': contentDisposition,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

// DELETE /api/uploads/:filename — delete file (admin only)
export async function DELETE(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const uid = await adminId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { filename } = await params;
  const decoded = decodeURIComponent(filename);
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, decoded);

  await ensureUploadsTable();

  try {
    // Remove from PostgreSQL
    await q('DELETE FROM uploads WHERE filename = $1', [decoded]);

    // Remove from disk
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error deleting file:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
