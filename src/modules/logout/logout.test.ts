import { User } from "./../../entity/User";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";

let conn: Connection;
const email = "test@test.com";
const password = "test";
let userId: string;
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

describe("logout", async () => {
  test("logout current user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // Login the User
    await client.login(email, password);

    // Get current User
    const response = await client.me();

    const currentUser = response.data.me;
    expect(currentUser.email).toEqual(email);
    expect(currentUser.id).toEqual(userId);

    // Logout user
    const logoutResponse = await client.logout();

    expect(logoutResponse.data.logout).toBeNull();
  });
});
