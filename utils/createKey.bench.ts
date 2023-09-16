import { createKey } from "./createKey.ts";

Deno.bench(async function createKeySmallPassword() {
  await createKey("foo", "bar");
});

Deno.bench(async function createKeyBiggerPassword() {
  await createKey("abiggerpassword", "abiggersalt");
});
