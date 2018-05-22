import { expiredKeyError } from "./errorMessages";
import { passwordNotLongEnough } from "./../register/errorMessages";
import { forgotPasswordLockAccount } from "./../../utils/forgotPasswordLockAccount";
import * as Redis from "ioredis";
import { createForgotPasswordLink } from "./../../utils/createForgotPasswordLink";
import { User } from "./../../entity/User";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";
import { forgotPasswordPrefix } from "../../constants";
import { forgotPasswordLockedError } from "../login/errorMessages";

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
            path: "newPassword",
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
