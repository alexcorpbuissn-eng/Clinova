import { NextResponse } from 'next/server';
import { logSystemEvent } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { level = 'ERROR', message, details } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await logSystemEvent(level, 'FRONTEND', message, details);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to process client log:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}
