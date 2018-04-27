import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import * as path from "path";
import { importSchema } from "graphql-import";
import { resolvers } from "./resolvers";
import { createConnection } from "typeorm";

const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));

export const startServer = async () => {
  const server = new GraphQLServer({ typeDefs, resolvers });
  await createConnection();

  await server.start();
  console.log("Server is running on localhost:4000");
};

startServer();
