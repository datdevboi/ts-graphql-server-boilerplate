import * as Redis from "ioredis";
import { createForgotPasswordLink } from "./../../utils/createForgotPasswordLink";
import { User } from "./../../entity/User";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";
import { forgotPasswordPrefix } from "../../constants";

let conn: Connection;
const email = "test@test.com";
const password = "test";
const newPassword = "newTestPassword";
let userId: string;
const redis = new Redis();

beforeAll(async () => {
  conn = await createTypeormConn();

  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();

  userId = user.id;
});

afterAll(async () => {
  await conn.close();
});

describe("forgot password", async () => {
  test("Make sure it works", async () => {
    // create client
    const client = new TestClient(process.env.TEST_HOST as string);

    const url = await createForgotPasswordLink("", userId, redis);
    const key = url.split("/").slice(-1)[0];

    const id = await redis.get(`${forgotPasswordPrefix}${key}`);
    expect(id).toEqual(userId);

    const response = await client.forgotPasswordChange(newPassword, key);

    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});
