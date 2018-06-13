import { expiredKeyError } from "./errorMessages";

import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import * as Redis from "ioredis";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { User } from "../../../entity/User";

import { Connection } from "typeorm";
import { TestClient } from "../../../utils/TestClient";
import * as faker from "faker";

import { forgotPasswordLockedError } from "../login/errorMessages";
import { createTestConn } from "../../../testUtils/createTestConn";
import { passwordNotLongEnough } from "../register/errorMessages";

let conn: Connection;
faker.seed(Date.now() + 0);
const email = faker.internet.password();
const password = faker.internet.password();
const newPassword = faker.internet.password();
let userId: string;
const redis = new Redis();

beforeAll(async () => {
  conn = await createTestConn();

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

    // lock account
    await forgotPasswordLockAccount(userId, redis);
    const url = await createForgotPasswordLink("", userId, redis);

    const key = url.split("/").slice(-1)[0];

    // Make sure user can't login
    const loginResponse = await client.login(email, password);

    expect(loginResponse.data.login).toEqual([
      {
        path: "email",
        message: forgotPasswordLockedError
      }
    ]);

    // try chaging a password that's too short
    expect(await client.forgotPasswordChange("oh", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "newPassword",
            message: passwordNotLongEnough
          }
        ]
      }
    });

    const response = await client.forgotPasswordChange(newPassword, key);

    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    // make sure redis key expires after password change
    expect(await client.forgotPasswordChange("newerPassword", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "key",
            message: expiredKeyError
          }
        ]
      }
    });

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});
