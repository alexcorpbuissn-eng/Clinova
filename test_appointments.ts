import * as dotenv from 'dotenv';
dotenv.config();
import { signToken } from './src/lib/auth';

async function main() {
  const token = await signToken({
    userId: 'test-user-id',
    role: 'ADMIN',
    clinicId: undefined // Simulating what verify-otp does
  });

  console.log("Generated Token:", token);
  
  // Make request to local next.js server
  const res = await fetch('http://localhost:3000/api/admin/appointments', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}
main();
