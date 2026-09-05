import { describe, expect, test } from "bun:test";

describe("One game session", () => {
  const user1 = "12354687";
  const user2 = "abcdef";

  test("Creating game session", async () => {
    const res = await fetch("http://localhost:5050/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id1: user1, id2: user2 }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("sessionId");
    expect(body).toHaveProperty("log");
  });
});
