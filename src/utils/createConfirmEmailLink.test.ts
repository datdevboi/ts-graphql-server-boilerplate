import * as Redis from "ioredis";
import fetch from "node-fetch";
import { createTypeormConn } from "./createTypeormConn";
import { User } from "./../entity/User";
import { createConfirmEmailLink } from "./createConfirmedEmailLink";

let user: User;
const redis: Redis.Redis = new Redis();
let id: string = "";

beforeAll(async () => {
  await createTypeormConn();
  user = await User.create({
    email: "test2@test.com",
    password: "test2@test"
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

  test("sends invalid back if bad id is used", async () => {
    const response = await fetch(
      `${process.env.TEST_HOST}/confirm/ajfkdjgijdirhakfj`
    );
    const text = await response.text();

    expect(text).toBe("invalid");
  });
});
