import Redis from 'ioredis';
import { redisUrl } from './configuration';

const redisClient = new Redis(redisUrl, {
  connectTimeout: 30000,  // 30 seconds timeout for initial connection
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 5000);
    return delay;
  },
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  // console.log('Connected to Redis');
});

redisClient.on('end', () => {
  console.warn('Redis connection closed');
});

redisClient.on('exit', () => {
  redisClient.quit();
});

redisClient.on('reconnecting', (times) => {
  // console.log(`Attempting to reconnect to Redis (attempt #${times})`);
});

// let lastActiveTime = Date.now();
// let idleTimeout;

// const IDLE_TIMEOUT_DURATION = 20 * 60 * 1000; // 20 minutes

// const gracefulShutdown = () => {
//   redisClient.quit(() => {
//     console.log('Redis connection closed through idle timeout');
//   });
// };

// const checkIdleTimeout = () => {
//   const now = Date.now();
//   const idleTime = now - lastActiveTime;
//   if (idleTime > IDLE_TIMEOUT_DURATION) {
//     console.log(`Redis idle timeout reached (${idleTime}ms). Shutting down.`);
//     gracefulShutdown();
//   } else {
//     const remainingTime = IDLE_TIMEOUT_DURATION - idleTime;
//     console.log(`Next check in ${remainingTime}ms for idle shutdown.`);
//     idleTimeout = setTimeout(checkIdleTimeout, remainingTime);
//   }
// };

// const resetIdleTimeout = () => {
//   if (idleTimeout) {
//     clearTimeout(idleTimeout);
//   }
//   lastActiveTime = Date.now();
//   idleTimeout = setTimeout(checkIdleTimeout, IDLE_TIMEOUT_DURATION);
// };

// // Hook into Redis client methods to reset idle timeout on activity
// const originalSendCommand = redisClient.sendCommand;
// redisClient.sendCommand = function (...args) {
//   resetIdleTimeout();
//   return originalSendCommand.apply(this, args);
// };

// process.on('SIGINT', gracefulShutdown);
// process.on('SIGTERM', gracefulShutdown);

// // Initial setup of idle timeout check
// resetIdleTimeout();

export default redisClient;
