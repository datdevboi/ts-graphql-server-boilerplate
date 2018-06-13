import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../../types/graphql-utils";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { User } from "../../../entity/User";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { userNotFoundError, expiredKeyError } from "./errorMessages";
import { forgotPasswordPrefix } from "../../../constants";
// import { invalidLogin, confirmEmailError } from "./errorMessages";
import * as yup from "yup";
import { formatYupError } from "../../../utils/formatYupError";
import { passwordNotLongEnough } from "../register/errorMessages";
// // TODO FIX THE GENERATE SCHEMA SCRIPT ERROR

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(3, passwordNotLongEnough)
    .max(255)
});

export const resolvers: ResolverMap = {
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
    forgotPasswordChange: async (_, { newPassword, key }, { redis }) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;
      const userId = await redis.get(redisKey);

      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError
          }
        ];
      }

      try {
        await schema.validate(
          { newPassword },
          {
            abortEarly: false
          }
        );
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePromise = User.update(
        { id: userId },
        {
          forgotPasswordLocked: false,
          password: hashedPassword
        }
      );

      const deleteKeyPromise = redis.del(redisKey);

      await Promise.all([updatePromise, deleteKeyPromise]);

      return null;
    }
  }
};
