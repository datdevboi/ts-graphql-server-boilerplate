import { request } from "graphql-request";
import { User } from "../../entity/User";
import { invalidLogin } from "./errorMessages";

const email = "test@test.com";
const password = "test1";

const registerMutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}"){
          path
          message
        }
    }
`;

const loginMutation = (e: string, p: string) => `
    mutation {
        login(email: "${e}", password: "${p}"){
          path
          message
        }
    }
`;

describe("login", () => {
  test("bad email", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation("bob@bob.com", "idontcare")
    );

    expect(response).toEqual({
      login: [
        {
          path: "email",
          message: invalidLogin
        }
      ]
    });
  });
});
