import { colors, parseFlags, resolve } from "../deps.ts";
import { createKey } from "../utils/createKey.ts";
import { storeKey } from "../utils/readAndStoreKeys.ts";
import { genKey } from "../utils/genKey.ts";

interface GenerateKeyOptions {
  name?: string;
  salt?: string;
  password?: string;
  dir?: string;
}

export async function generateKey(options: GenerateKeyOptions = {}) {
  const { password, salt } = options;
  let { name, dir } = options;

  if (!dir) {
    dir = "./";
  }

  if (!name) {
    name = "aes-gcm-256-" + new Date().getTime();
  }

  const filePath = `${dir}/${name}.key`;

  if (password && !salt) {
    throw new Error("You must enter a salt with a password");
  }

  if (salt && !password) {
    throw new Error("You must enter a password with a salt");
  }

  console.log(colors.brightBlue(`\nCreating key: ${name}`));
  const key = password && salt
    ? await createKey(password, salt)
    : await genKey();

  try {
    await storeKey(filePath, key);
  } catch (err) {
    if (err instanceof Deno.errors.AlreadyExists) {
      throw new Error(`Could not create key. ${filePath} already exists.`);
    } else throw err;
  }
  console.log(colors.brightGreen("\nSuccess 🎉 🎊"));
  console.log(
    colors.brightGreen(`New key stored in: `) + colors.white(resolve(filePath)),
  );
  return filePath;
}

if (import.meta.main) {
  const args = parseFlags(Deno.args);

  const {
    p: password,
    s: salt,
    n: name,
    _: [dir],
  } = args;

  generateKey({ name, dir: dir as string, salt, password });
}
