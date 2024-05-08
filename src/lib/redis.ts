// redis.ts
import Redis from 'ioredis';
import { redisUrl } from './configuration';

const createRedisInstance = () => {
  return new Redis(redisUrl);
};

export default createRedisInstance;
