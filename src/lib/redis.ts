// redis.ts
import Redis from 'ioredis';
import { redisUrl } from './configuration';

const redisClient = new Redis(redisUrl);

redisClient.on('error', (err) => {
  console.error('Redis error (from redis.ts):', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('end', () => {
  console.warn('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

const gracefulShutdown = () => {
  redisClient.quit(() => {
    console.log('Redis connection closed through app termination');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default redisClient;
