import { userSessionIdPrefix, redisSessionPrefix } from "./../../constants";
import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;

      if (userId) {
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

        return true;
      }

      return false;
    }
  }
};
