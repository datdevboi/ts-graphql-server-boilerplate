import { TestClient } from "./../../utils/TestClient";
import { User } from "./../../entity/User";
import axios from "axios";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";

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

const loginMutation = (e: string, p: string) => `
    mutation {
        login(email: "${e}", password: "${p}"){
          path
          message
        }
    }
`;

const meQuery = `
    {
      me {
        id
        email
      }
    }
`;
describe("me", async () => {
  test("return null if no cookie", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    // User is not logged in
    const response = await client.me();

    expect(response.data.me).toBeNull();
  });

  test("get current user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    // Login the user
    await client.login(email, password);

    // Get current User
    const response = await client.me();

    const currentUser = response.data.me;
    expect(currentUser.email).toEqual(email);
    expect(currentUser.id).toEqual(userId);
  });
});
