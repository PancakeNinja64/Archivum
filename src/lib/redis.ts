import "server-only";
import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redisClient?: RedisClientType;
};

export async function getRedis(): Promise<RedisClientType> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is not configured");
  }

  let client = globalForRedis.redisClient;

  if (!client) {
    client = createClient({
      url: redisUrl,
    });

    client.on("error", (error) => {
      console.error("Redis client error:", error);
    });

    globalForRedis.redisClient = client;
  }

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}