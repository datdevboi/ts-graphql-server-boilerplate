import { createTypeormConn } from "./../../utils/createTypeormConn";
import { request } from "graphql-request";
import { User } from "../../entity/User";

import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
import { Connection } from "typeorm";

const email = "test@test.com";
const password = "test1";

const mutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}"){
          path
          message
        }
    }
`;

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
});

afterAll(async () => {
  await conn.close();
});

describe("Register User", async () => {
  it("check for duplicate emails", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(response).toEqual({ register: null });

    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toBe(email);
    expect(user.password).not.toEqual(password);

    // test for duplicate emails
    const response2: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(response2.register).toHaveLength(1);
    expect(response2.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  it("check a bad email", async () => {
    // catch bad email
    const response3: any = await request(
      process.env.TEST_HOST as string,
      mutation("b", password)
    );

    expect(response3).toEqual({
      register: [
        { message: emailNotLongEnough, path: "email" },
        { message: invalidEmail, path: "email" }
      ]
    });
  });

  it("check bad password and bad email", async () => {
    // catch bad password and bad email
    const response4: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, "12")
    );

    expect(response4).toEqual({
      register: [{ message: passwordNotLongEnough, path: "password" }]
    });

    const response5: any = await request(
      process.env.TEST_HOST as string,
      mutation("12", "34")
    );

    expect(response5).toEqual({
      register: [
        { message: emailNotLongEnough, path: "email" },
        { message: invalidEmail, path: "email" },
        { message: passwordNotLongEnough, path: "password" }
      ]
    });
  });
});
