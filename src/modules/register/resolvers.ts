import * as bcrypt from "bcryptjs";
import * as yup from "yup";
import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3)
    .max(255)
    .email(),
  password: yup
    .string()
    .min(3)
    .max(255)
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      try {
        await schema.validate(args, {
          abortEarly: false
        });
      } catch (err) {
        console.log(err);
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
            message: "Email already taken"
          }
        ];
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      });

      await user.save();

      return null;
    }
  }
};
