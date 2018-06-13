import { userSessionIdPrefix } from "../../../constants";
import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import {
  invalidLogin,
  confirmEmailError,
  forgotPasswordLockedError
} from "./errorMessages";

// TODO FIX THE GENERATE SCHEMA SCRIPT ERROR
export const resolvers: ResolverMap = {
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

      const valid = await bcrypt.compare(password, user.password as string);

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

      // Check if accounts locked
      if (user.forgotPasswordLocked) {
        return [
          {
            path: "email",
            message: forgotPasswordLockedError
          }
        ];
      }

      // login succesful
      session.userId = user.id;

      // store session id in a list with the key of the userid
      await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID);

      return null;
    }
  }
};
