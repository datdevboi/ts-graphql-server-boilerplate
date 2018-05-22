import { ResolverMap } from "../../types/graphql-utils";
import { forgotPasswordLockAccount } from "../../utils/forgotPasswordLockAccount";
import { User } from "../../entity/User";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";
import { userNotFoundError } from "./errorMessages";
// import { invalidLogin, confirmEmailError } from "./errorMessages";

// // TODO FIX THE GENERATE SCHEMA SCRIPT ERROR
export const resolvers: ResolverMap = {
  Query: {
    dummy2: () => "bye"
  },
  Mutation: {
    sendForgotPasswordEmail: async (_, { email }, { redis }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: "email",
            message: userNotFoundError
          }
        ];
      }

      // lock account
      await forgotPasswordLockAccount(user.id, redis);
      // @todo add frontend url
      await createForgotPasswordLink("", user.id, redis);
      // @todo send email with url

      return true;
    },
    forgotPasswordChange: async (_, { newEmail, key }, { redis }) => null
  }
};
