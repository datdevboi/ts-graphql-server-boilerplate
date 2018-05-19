import { redisSessionPrefix } from "./constants";
import { genSchema } from "./utils/genSchema";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connect from "connect-redis";
import { createTypeormConn } from "./utils/createTypeormConn";

import { confirmEmail } from "./routes/confirmEmail";
import { redis } from "./redis";
import "dotenv/config";

const RedisStore = connect(session);
export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
      req: request
    })
  });

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
      }),
      name: "qid",
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" ? "*" : "http://localhost:3000"
  };

  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConn();

  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");

  return app;
};
