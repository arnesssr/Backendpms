import IORedis, { RedisOptions } from 'ioredis';

const isTest = process.env.NODE_ENV === 'test';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: isTest ? 1 : 5,
  enableReadyCheck: true,
  retryStrategy(times: number) {
    if (isTest) return null; // Return null instead of false for test env
    return Math.min(times * 50, 2000);
  },
  reconnectOnError(err: Error) {
    return err.message.includes('READONLY');
  }
};

const redis = new IORedis(process.env.REDIS_URL!, redisOptions);

// Error handling
redis.on('error', (error: Error) => {
  if (!isTest) console.error('Redis connection error:', error.message);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  console.log('✅ Redis ready to receive commands');
});

export { redis };
