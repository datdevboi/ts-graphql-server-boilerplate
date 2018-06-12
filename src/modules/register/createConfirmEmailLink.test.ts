import { createTestConn } from "./../../testUtils/createTestConn";
import * as Redis from "ioredis";
import fetch from "node-fetch";

import { User } from "../../entity/User";
import { createConfirmEmailLink } from "./createConfirmedEmailLink";

const redis: Redis.Redis = new Redis();
let userId: string = "";

beforeAll(async () => {
  await createTestConn();
  const createdUser = await User.create({
    email: "test3@test.com",
    password: "test3@test"
  }).save();

  userId = createdUser.id;
});

describe("test createConfirmEmailLink", async () => {
  test("Make sure it confirms user and clears key in redis", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId,
      redis
    );

    const response = await fetch(url);
    const text = await response.text();

    expect(text).toBe("ok");
    const user: User = await User.findOne({
      where: {
        id: userId
      }
    });
    expect(user.confirmed).toBeTruthy();

    const urlArray = url.split("/");
    const id = urlArray[urlArray.length - 1];

    const data = await redis.get(id);
    expect(data).toBeNull();
  });
});
