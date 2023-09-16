import { genKey } from "./genKey.ts";

Deno.bench(async function generateKey() {
  await genKey();
});
