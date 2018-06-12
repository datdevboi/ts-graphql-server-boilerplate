import { createTestConn } from "./../../testUtils/createTestConn";
import * as Redis from "ioredis";
import fetch from "node-fetch";

import { User } from "../../entity/User";
import { createConfirmEmailLink } from "./createConfirmedEmailLink";

let user: User;
const redis: Redis.Redis = new Redis();
let id: string = "";

beforeAll(async () => {
  await createTestConn();
  user = await User.create({
    email: "test3@test.com",
    password: "test3@test"
  }).save();
});

describe("test createConfirmEmailLink", async () => {
  test("Make sure it confirms user and clears key in redis", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      user.id,
      redis
    );

    const response = await fetch(url);
    const text = await response.text();

    expect(text).toBe("ok");
    await user.reload();
    expect(user.confirmed).toBeTruthy();

    const urlArray = url.split("/");
    id = urlArray[urlArray.length - 1];

    const data = await redis.get(id);
    expect(data).toBeNull();
  });
});
