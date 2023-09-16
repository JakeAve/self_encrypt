import { EncDecScriptHelper } from "./EncDecScriptHelper.ts";

const HELPER_KEY_PATH = "./test_utils/helper.key";
const TEXT_FILE_PATH = "test_utils/test.txt";

Deno.bench(async function encryptFileScriptBench(b) {
  b.start();
  await EncDecScriptHelper(TEXT_FILE_PATH, HELPER_KEY_PATH, "encrypt");
  b.end();
  await EncDecScriptHelper(TEXT_FILE_PATH, HELPER_KEY_PATH, "decrypt");
});

Deno.bench(async function decryptFileScriptBench(b) {
  await EncDecScriptHelper(TEXT_FILE_PATH, HELPER_KEY_PATH, "encrypt");
  b.start();
  await EncDecScriptHelper(TEXT_FILE_PATH, HELPER_KEY_PATH, "decrypt");
  b.end();
});
