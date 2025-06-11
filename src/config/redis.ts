import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries: number) => Math.min(retries * 50, 1000)
  }
});

// Initialize connection
redisClient.on('error', (err: Error) => console.error('Redis Client Error:', err));
redisClient.connect().catch(console.error);

// Add named export in addition to default export
export { redisClient as redis };
export default redisClient;
