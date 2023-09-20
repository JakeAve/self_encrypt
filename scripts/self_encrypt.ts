import { Command, Input, resolve, Select } from "../deps.ts";
import { EncDecScriptHelper } from "../utils/EncDecScriptHelper.ts";
import { createKey } from "../utils/createKey.ts";
import { getKeys, keys } from "./keys.ts";

const MAIN_PATH = Deno.env.get("SELF_ENCRYPT_INSTALL");
if (!MAIN_PATH) {
  throw new Error("Could not find .self_encrypt_🔐 path");
}
const KEYS = resolve(MAIN_PATH, "keys_🔑🔑");

const cli = new Command()
  .name("self_encrypt")
  .version("0.1.0")
  .description("Generate keys, encrypt files and decrypt files")
  .command("enc", "Encrypt command")
  .arguments("<path_to_file:string> [keyname_or_path_to_key:string]")
  .description(
    "Encrypt a file using one of your keys or using a dynamically generated key, repeatable by entering the same password and salt",
  )
  .action(encryptOrDecrypt("encrypt"))
  .command("dec", "Decrypt command")
  .arguments("<path_to_file:string> [keyname_or_path_to_key:string]")
  .description(
    "Decrypt a file using one of your keys or using a dynamically generated key, repeatable by entering the same password and salt",
  )
  .action(encryptOrDecrypt("decrypt"))
  .command("keys", keys);

async function findKey(keynameOrPath: string) {
  let filePath = "";
  for await (const entry of Deno.readDir(KEYS)) {
    if (entry.name.includes(keynameOrPath)) {
      filePath = entry.name;
    }
  }
  if (filePath) {
    return resolve(KEYS, filePath);
  }
  try {
    const { isFile } = await Deno.stat(filePath);
    if (isFile) return filePath;
  } catch {
    return undefined;
  }
}

async function makeKeyOptions() {
  const keys = await getKeys();
  const options: { name: string; value: string }[] = keys.map(
    ({ name, path }) => ({ name, value: path }),
  );
  options.push({ name: "Use password and salt", value: "pass_and_salt" });
  return options;
}

function encryptOrDecrypt(func: "encrypt" | "decrypt") {
  return async (_options: void, ...args: [string, (string | undefined)?]) => {
    const [filePath] = args;
    let [, keynameOrPath] = args;

    if (keynameOrPath) {
      keynameOrPath = await findKey(keynameOrPath);
    }

    if (!keynameOrPath) {
      const keyOption = await Select.prompt({
        message: "Choose a key",
        options: await makeKeyOptions(),
      });
      // @ts-ignore this is a bug
      keynameOrPath = keyOption as string;
    }

    if (keynameOrPath === "pass_and_salt") {
      const password: string = await Input.prompt("Enter the password: ");
      const salt: string = await Input.prompt("Enter the salt: ");
      const key = await createKey(password, salt);
      EncDecScriptHelper(filePath as string, key, func, {
        logSuccess: true,
      });
      return;
    }

    EncDecScriptHelper(filePath as string, keynameOrPath as string, func, {
      logSuccess: true,
    });
  };
}

if (import.meta.main) {
  if (!Deno.args.length) {
    cli.showHelp();
  } else {
    cli.parse(Deno.args);
  }
}
