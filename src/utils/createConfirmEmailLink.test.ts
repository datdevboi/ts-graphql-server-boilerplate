import * as Redis from "ioredis";
import fetch from "node-fetch";
import { createTypeormConn } from "./createTypeormConn";
import { User } from "./../entity/User";
import { createConfirmEmailLink } from "./createConfirmedEmailLink";

let user: User;

beforeAll(async () => {
  await createTypeormConn();
  user = await User.create({
    email: "test@test.com",
    password: "test@test"
  }).save();
});
test("Make sure createConfirmEmailLink", async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    user.id as string,
    new Redis()
  );

  const response = await fetch(url);
  const text = await response.text();

  expect(text).toBe("ok");
});
