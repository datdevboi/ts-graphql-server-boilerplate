// import { userSessionIdPrefix } from "./../../constants";
// import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
// import { User } from "../../entity/User";
// import { invalidLogin, confirmEmailError } from "./errorMessages";

// // TODO FIX THE GENERATE SCHEMA SCRIPT ERROR
export const resolvers: ResolverMap = {
  Query: {
    dummy2: () => "bye"
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      {  }: GQL.IRegisterOnMutationArguments,
      {}
    ) => null,
    forgotPasswordChange: async (
      _,
      {  }: GQL.IRegisterOnMutationArguments,
      {}
    ) => null
  }
};
