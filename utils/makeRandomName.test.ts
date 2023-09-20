import { assertEquals } from "$std/assert/assert_equals.ts";
import { makeRandomName } from "./makeRandomName.ts";

Deno.test("makeRandomName works", () => {
  const names: string[] = [];
  for (let i = 0; i < 1000; i++) {
    names.push(makeRandomName());
  }
  const set = new Set(names);
  assertEquals(set.size, 1000);
});
