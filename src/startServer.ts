import "dotenv/config";
import * as passport from "passport";
import { Strategy } from "passport-twitter";
import * as RateLimit from "express-rate-limit";
import { redisSessionPrefix } from "./constants";
import { genSchema } from "./utils/genSchema";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connect from "connect-redis";
import { createTypeormConn } from "./utils/createTypeormConn";
import * as RateLimitRedis from "rate-limit-redis";
import { confirmEmail } from "./routes/confirmEmail";
import { redis } from "./redis";
import { User } from "./entity/User";

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
    new RateLimit({
      store: new RateLimitRedis({
        client: redis
      }),
      windowMs: 15 * 60 * 1000,
      max: 100,
      delayMs: 0
    })
  );

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
    origin: process.env.NODE_ENV === "test" ? "*" : "http://localhost:4000"
  };

  server.express.get("/confirm/:id", confirmEmail);

  const connection = await createTypeormConn();

  passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
        callbackURL: "http://localhost:4000/auth/twitter/callback",
        includeEmail: true
      },
      async (_, __, profile, cb) => {
        const { id, emails } = profile;

        const query = connection
          .getRepository(User)
          .createQueryBuilder("user")
          .where("user.twitterId = :id", { id });

        let email: string | null = null;
        if (emails) {
          email = emails[0].value;

          query.orWhere("user.email = :email", { email }).getOne();
        }

        let user = await query.getOne();

        // this user needs to be created
        if (!user) {
          user = await User.create({
            twitterId: id,
            email
          }).save();
        } else if (!user.twitterId) {
          // we found user by email
          user.twitterId = id;
          await user.save();
        } else {
          // we have a twitter id
          // login
        }

        return cb(null, { id: user.id });
      }
    )
  );

  server.express.use(passport.initialize());

  server.express.get("/auth/twitter", passport.authenticate("twitter"));

  server.express.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { session: false }),
    (req, res) => {
      (req.session as any).userId = (req.user as any).id;
      // Successful authentication, redirect home.
      res.redirect("/");
    }
  );

  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");

  return app;
};
