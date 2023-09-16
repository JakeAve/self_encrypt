import { parse as parseFlags } from "$std/flags/mod.ts";
import { EncDecScriptHelper } from "../utils/EncDecScriptHelper.ts";

const args = parseFlags(Deno.args);

const {
  _: [filePath],
  k: keyPath,
} = args;

EncDecScriptHelper(filePath as string, keyPath, "decrypt", {
  logSuccess: true,
});
