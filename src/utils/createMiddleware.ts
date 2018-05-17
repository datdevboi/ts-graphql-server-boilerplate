import { Resolver, GraphQLMiddlewareFunc } from "../types/graphql-utils";

export const createMiddleware = (
  middlewareFunc: GraphQLMiddlewareFunc,
  resolverFun: Resolver
) => (parent: any, args: any, context: any, info: any) => {
  return middlewareFunc(resolverFun, parent, args, context, info);
};
