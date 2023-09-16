import { assertFalse } from "$std/assert/assert_false.ts";
import { genKey } from "./genKey.ts";

Deno.test("Test genKey", async () => {
  const key1 = await genKey();
  const raw1 = await crypto.subtle.exportKey("raw", key1);
  const parsedKey1 = [...new Uint8Array(raw1)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const key2 = await genKey();
  const raw2 = await crypto.subtle.exportKey("raw", key2);
  const parsedKey2 = [...new Uint8Array(raw2)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  assertFalse(parsedKey1 === parsedKey2);
});
