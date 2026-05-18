import Redis from 'ioredis';

// TODO: BullMQ is currently disabled in favor of Vercel Cron for reminder jobs.
// This Redis connection is a placeholder for future background job implementations.

const redisUrl = process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});
