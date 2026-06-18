import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Generate one with: openssl rand -hex 32');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Payload structure
export interface JWTPayload {
  userId: string;
  role: string;
  clinicId?: string;   // null/undefined for SUPER_ADMIN (no clinic)
  doctorId?: string;
  [key: string]: any;
}

/**
 * Sign a payload into a JWT token
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare a password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
