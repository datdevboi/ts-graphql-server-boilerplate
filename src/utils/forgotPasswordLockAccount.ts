import { removeAllUserSessions } from "./removeAllUserSessions";
import { Redis } from "ioredis";
import { User } from "../entity/User";
export const forgotPasswordLockAccount = async (
  userId: string,
  redis: Redis
) => {
  // User can't login
  await User.update({ id: userId }, { forgotPasswordLocked: true });

  // Remove all their sessions
  await removeAllUserSessions(userId, redis);
};
