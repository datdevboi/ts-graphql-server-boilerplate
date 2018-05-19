import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { invalidLogin, confirmEmailError } from "./errorMessages";

// TODO FIX THE GENERATE SCHEMA SCRIPT ERROR
export const resolvers: ResolverMap = {
  Query: {
    bye2: () => "bye"
  },
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments,
      { session, redis, req }
    ) => {
      // Find User
      const user = await User.findOne({
        where: {
          email
        }
      });

      if (!user) {
        return [
          {
            path: "email",
            message: invalidLogin
          }
        ];
      }

      // Check password is correct

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return [
          {
            path: "email",
            message: invalidLogin
          }
        ];
      }

      // Check User verified their email
      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: confirmEmailError
          }
        ];
      }

      // login succesful
      session.userId = user.id;

      // store session id in a list with the key of the userid
      await redis.lpush(user.id, req.sessionID);

      return null;
    }
  }
};
