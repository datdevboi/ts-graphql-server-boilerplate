import { User } from "./../entity/User";
import { host } from "./constants";
import { request } from "graphql-request";
import { createTypeormConn } from "../utils/createTypeormConn";

beforeAll(async () => {
  await createTypeormConn();
});
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

  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toBe(email);
  expect(user.password).not.toEqual(password);
});
