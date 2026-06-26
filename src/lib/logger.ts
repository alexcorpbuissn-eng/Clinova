import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';

/**
 * Log an event to the database and optionally a local file during development.
 */
export async function logSystemEvent(
  level: 'INFO' | 'WARN' | 'ERROR',
  source: 'FRONTEND' | 'BACKEND',
  message: string,
  details?: any
) {
  const detailsStr = details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null;

  try {
    // 1. Save to Database for persistence and SuperAdmin dashboard
    await prisma.systemLog.create({
      data: {
        level,
        source,
        message,
        details: detailsStr,
      },
    });

    // 2. Also log to console for Vercel logs / server terminal
    const logLine = `[${new Date().toISOString()}] [${level}] [${source}] ${message} ${detailsStr ? `- ${detailsStr}` : ''}`;
    if (level === 'ERROR') {
      console.error(logLine);
    } else if (level === 'WARN') {
      console.warn(logLine);
    } else {
      console.log(logLine);
    }

    // 3. For AI development assistance, append to local file (only works outside serverless!)
    if (process.env.NODE_ENV !== 'production') {
      try {
        const logFilePath = path.join(process.cwd(), 'system_logs_dev.txt');
        fs.appendFileSync(logFilePath, logLine + '\n');
      } catch (fileErr) {
        // Ignore file errors on Vercel
      }
    }
  } catch (err) {
    console.error('Failed to write to system log:', err);
  }
}
