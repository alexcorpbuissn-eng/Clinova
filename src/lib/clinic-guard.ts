/**
 * clinic-guard.ts — Middleware-утилита для Multi-Tenant авторизации.
 *
 * Используется во всех API-маршрутах Этапа 2.
 * Проверяет JWT, извлекает clinicId, role, userId.
 *
 * Паттерн использования:
 *   const session = await requireClinicAccess(request);
 *   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   // Дальше используй session.clinicId в prisma where-запросах
 */

import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth';

export interface ClinicSession {
  userId: string;
  role: string;
  clinicId: string | undefined; // undefined для SUPER_ADMIN
  doctorId: string | undefined;
}

/**
 * Проверяет Bearer токен и возвращает сессию с clinicId.
 * Возвращает null если токен отсутствует или невалиден.
 */
export async function requireClinicAccess(request: NextRequest): Promise<ClinicSession | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const payload: JWTPayload | null = await verifyToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    role: payload.role,
    clinicId: payload.clinicId,
    doctorId: payload.doctorId,
  };
}

/**
 * Проверяет что пользователь имеет одну из указанных ролей И принадлежит клинике.
 * SUPER_ADMIN проходит все проверки ролей.
 */
export async function requireRole(
  request: NextRequest,
  roles: string[]
): Promise<ClinicSession | null> {
  const session = await requireClinicAccess(request);
  if (!session) return null;

  if (session.role === 'SUPER_ADMIN') return session;
  if (!roles.includes(session.role)) return null;

  return session;
}
