import IORedis, { RedisOptions } from 'ioredis';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true, // Don't connect immediately
  autoResubscribe: false,
  autoResendUnfulfilledCommands: false
};

class RedisClient {
  private static instance: IORedis;

  public static getInstance(): IORedis {
    if (!RedisClient.instance) {
      RedisClient.instance = new IORedis(process.env.REDIS_URL!, redisOptions);
    }
    return RedisClient.instance;
  }

  public static async closeConnection() {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null!;
    }
  }
}

export const redis = RedisClient.getInstance();
export const closeRedis = RedisClient.closeConnection;
