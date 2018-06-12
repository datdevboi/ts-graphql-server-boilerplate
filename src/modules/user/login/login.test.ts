import { createTestConn } from "./../../testUtils/createTestConn";
import { TestClient } from "./../../utils/TestClient";

import * as faker from "faker";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../entity/User";
import { Connection } from "typeorm";

const email = faker.internet.email();
const password = faker.internet.password();

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errorMsg: string
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errorMsg
      }
    ]
  });
};

let conn: Connection;

beforeAll(async () => {
  conn = await createTestConn();
});

afterAll(async () => {
  await conn.close();
});

describe("login", () => {
  test("test bad email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    loginExpectError(client, "bob@bob.com", "idontcare", invalidLogin);
  });

  test("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.register(email, password);

    await loginExpectError(client, email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(client, email, "kdjaifjdfihdfj", invalidLogin);

    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});
