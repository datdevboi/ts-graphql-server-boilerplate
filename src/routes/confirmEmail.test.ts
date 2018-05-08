import fetch from "node-fetch";

test("sends invalid back if bad id is used", async () => {
  const response = await fetch(
    `${process.env.TEST_HOST}/confirm/ajfkdjgijdirhakfj`
  );
  const text = await response.text();

  expect(text).toBe("invalid");
});
