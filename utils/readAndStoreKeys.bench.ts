import { genKey } from "./genKey.ts";
import { readKey, storeKey } from "./readAndStoreKeys.ts";

const TEST_KEY_PATH = "./test_utils/key.key";

Deno.bench(async function storeNewKey(b) {
  const key = await genKey();
  b.start();
  await storeKey(TEST_KEY_PATH, key);
  b.end();
  await Deno.remove(TEST_KEY_PATH);
});

Deno.bench(async function readStoredKey(b) {
  const key = await genKey();
  await storeKey(TEST_KEY_PATH, key);
  b.start();
  await readKey(TEST_KEY_PATH);
  b.end();
  await Deno.remove(TEST_KEY_PATH);
});
