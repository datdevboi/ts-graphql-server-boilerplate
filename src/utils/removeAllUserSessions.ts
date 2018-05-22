import { Redis } from "ioredis";
import { userSessionIdPrefix, redisSessionPrefix } from "../constants";
export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  );

  const sessionPromises: any = [];

  sessionIds.forEach((id: string) => {
    sessionPromises.push(redis.del(`${redisSessionPrefix}${id}`));
  });

  await Promise.all(sessionPromises);
};
