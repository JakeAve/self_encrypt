import { assert } from "$std/assert/mod.ts";
import { EncDecScriptHelper } from "./EncDecScriptHelper.ts";
import { genKey } from "./genKey.ts";

const LARGE_TEXT_FILE_PATH = "./test_utils/test.txt";
const HELPER_KEY_PATH = "./test_utils/helper.key";

Deno.test("EncDecScriptHelper works", async () => {
  await EncDecScriptHelper(LARGE_TEXT_FILE_PATH, HELPER_KEY_PATH, "encrypt", {
    logSuccess: false,
  });
  await EncDecScriptHelper(LARGE_TEXT_FILE_PATH, HELPER_KEY_PATH, "decrypt", {
    logSuccess: false,
  });
  assert(true);
});

Deno.test("EncDecScriptHelper works with a crypto key", async () => {
  const key = await genKey();
  await EncDecScriptHelper(LARGE_TEXT_FILE_PATH, key, "encrypt", {
    logSuccess: false,
  });
  await EncDecScriptHelper(LARGE_TEXT_FILE_PATH, key, "decrypt", {
    logSuccess: false,
  });
  assert(true);
});
