import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET() {
  const redis = await getRedis();

  await redis.set("archivum:test", "connected");

  const value = await redis.get("archivum:test");

  return NextResponse.json({
    redis: value,
  });
}