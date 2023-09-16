import { assertEquals } from "$std/assert/mod.ts";
import { readKey, storeKey } from "./readAndStoreKeys.ts";
import { createKey } from "./createKey.ts";

const TEST_FILE_PATH = "./test_key.key";

Deno.test(
  "Test readAndStoreKey",
  { permissions: { read: true, write: true } },
  async () => {
    const key = await createKey("foo", "bar");

    try {
      await storeKey(TEST_FILE_PATH, key);
    } catch (err) {
      if (err instanceof Deno.errors.AlreadyExists) {
        await Deno.remove(TEST_FILE_PATH);
        await storeKey(TEST_FILE_PATH, key);
      }
    }
    const storedKey = await readKey(TEST_FILE_PATH);

    const rawKey1 = await crypto.subtle.exportKey("raw", key);
    const parsed1 = [...new Uint8Array(rawKey1)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const rawKey2 = await crypto.subtle.exportKey("raw", storedKey);
    const parsed2 = [...new Uint8Array(rawKey2)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    assertEquals(parsed1, parsed2);
    await Deno.remove(TEST_FILE_PATH);
  },
);
