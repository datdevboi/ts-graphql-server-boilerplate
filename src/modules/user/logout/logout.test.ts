import { createTestConn } from "../../../testUtils/createTestConn";
import { User } from "../../../entity/User";

import { Connection } from "typeorm";
import { TestClient } from "../../../utils/TestClient";
import * as faker from "faker";

let conn: Connection;
faker.seed(Date.now() + 2);
const email = faker.internet.email();
const password = faker.internet.password();
let userId: string;
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

describe("logout", async () => {
  test("multiple sessions", async () => {
    // create 1st session
    const client1 = new TestClient(process.env.TEST_HOST as string);
    // create 2nd session
    const client2 = new TestClient(process.env.TEST_HOST as string);

    // session 1 login
    await client1.login(email, password);
    // session 2 login
    await client2.login(email, password);

    // Make sure we get the same user
    expect(await client1.me()).toEqual(await client2.me());

    // Logout one of the users
    await client1.logout();

    expect(await client1.me()).toEqual(await client2.me());
  });

  test("single sessions", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // Login the User
    await client.login(email, password);

    // Get current User
    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    // Logout user
    await client.logout();

    const response2 = await client.me();

    expect(response2.data.me).toBeNull();
  });
});
