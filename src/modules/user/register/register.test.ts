import { createTestConn } from "../../../testUtils/createTestConn";

import { User } from "../../../entity/User";
import * as faker from "faker";

import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
import { Connection } from "typeorm";
import { TestClient } from "../../../utils/TestClient";

faker.seed(Date.now() + 4);
const email = faker.internet.email();
const password = faker.internet.password();

let conn: Connection;

beforeAll(async () => {
  conn = await createTestConn();
});

afterAll(async () => {
  await conn.close();
});

describe("Register User", async () => {
  it("check for duplicate emails", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    // Register User
    const response = await client.register(email, password);
    expect(response.data).toEqual({ register: null });

    // Find users with that email and Check there is only one
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toBe(email);
    expect(user.password).not.toEqual(password);

    // test for duplicate emails
    const response2: any = await client.register(email, "testing");
    expect(response2.data.register).toHaveLength(1);
    expect(response2.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  it("check a bad email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    // catch bad email
    const response3 = await client.register("b", password);

    expect(response3.data).toEqual({
      register: [
        { message: emailNotLongEnough, path: "email" },
        { message: invalidEmail, path: "email" }
      ]
    });
  });

  it("check bad password and bad email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    // catch bad password
    const response4: any = await client.register(email, "b");

    expect(response4.data).toEqual({
      register: [{ message: passwordNotLongEnough, path: "password" }]
    });

    // catch a bad password and email
    const response5 = await client.register("12", "32");

    expect(response5.data).toEqual({
      register: [
        { message: emailNotLongEnough, path: "email" },
        { message: invalidEmail, path: "email" },
        { message: passwordNotLongEnough, path: "password" }
      ]
    });
  });
});
