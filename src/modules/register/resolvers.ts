import * as yup from "yup";
import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { formatYupError } from "../../utils/formatYupError";
import {
  duplicateEmail,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
import { createConfirmEmailLink } from "../../utils/createConfirmedEmailLink";
import sendEmail from "../../utils/sendEmail";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3)
    .max(255)
    .email(invalidEmail),
  password: yup
    .string()
    .min(3, passwordNotLongEnough)
    .max(255)
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, context) => {
      try {
        await schema.validate(args, {
          abortEarly: false
        });
      } catch (err) {
        return formatYupError(err);
      }

      const { email, password } = args;

      const userAlreadyExist = await User.findOne({
        where: {
          email
        },
        select: ["id"]
      });

      if (userAlreadyExist) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }

      const user = User.create({
        email,
        password
      });

      await user.save();

      const url = await createConfirmEmailLink(
        context.url,
        user.id,
        context.redis
      );

      if (process.env.NODE_ENV !== "test") {
        await sendEmail(user.email, url);
      }

      return null;
    }
  }
};
