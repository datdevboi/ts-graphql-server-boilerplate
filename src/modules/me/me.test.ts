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
  test("can't get user if not logged in", async () => {
    // later
  });

  test("get current user", async () => {
    // Login the user
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );

    // Get current User
    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    );

    const currentUser = response.data.data.me;
    expect(currentUser.email).toEqual(email);
    expect(currentUser.id).toEqual(userId);
  });
});
