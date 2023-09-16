import { assertEquals } from "$std/assert/mod.ts";
import { createKey } from "./createKey.ts";

Deno.test("Test createKey", async () => {
  const created = await createKey("foo", "bar");
  const raw = await crypto.subtle.exportKey("raw", created);
  const parsed = [...new Uint8Array(raw)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  assertEquals(
    parsed,
    "1aeec70d6fe8848985c210050b03a2a0f90ec170ca720a523f1e30c2c2142245",
  );
});
