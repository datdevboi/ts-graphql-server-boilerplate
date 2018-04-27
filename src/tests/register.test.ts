import { host } from "./constants";
import { request } from "graphql-request";

const email = "test@test.com";
const password = "test";

const mutation = `
    mutation {
        register(email: "${email}", password: "${password}")
    }
`;

test("Register User", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
});
