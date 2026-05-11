import { NextRequest, NextResponse } from 'next/server';

// In-memory store: Map<ip, { count, resetAt }>
// For production, replace this with a Redis-backed store (ioredis)
const ipStore = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export function rateLimitCheck(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const now = Date.now();

  const record = ipStore.get(ip);

  if (!record || now > record.resetAt) {
    // First request or window expired — reset
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null; // Allow
  }

  if (record.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { success: false, error: 'Juda ko\'p so\'rov yuborildi. 10 daqiqadan keyin qayta urinib ko\'ring.' },
      { status: 429 }
    );
  }

  record.count++;
  return null; // Allow
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/public/book')) {
    const limited = rateLimitCheck(request);
    if (limited) return limited;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/public/book'],
};
