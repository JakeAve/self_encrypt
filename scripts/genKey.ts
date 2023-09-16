import * as colors from "$std/fmt/colors.ts";
import { resolve } from "$std/path/resolve.ts";
import { parse as parseFlags } from "$std/flags/mod.ts";
import { createKey } from "../utils/createKey.ts";
import { storeKey } from "../utils/readAndStoreKeys.ts";
import { genKey } from "../utils/genKey.ts";

const args = parseFlags(Deno.args);

const {
  p: password,
  s: salt,
  n: name,
  _: [dir],
} = args;

generateKey({ name, dir: dir as string, salt, password });

interface GenerateKeyOptions {
  name: string;
  salt: string;
  password: string;
  dir: string;
}

async function generateKey(options: GenerateKeyOptions) {
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
    console.log(colors.brightYellow("You must enter a salt with a password"));
    return;
  }

  if (salt && !password) {
    console.log(colors.brightYellow("You must enter a password with a salt"));
    return;
  }

  console.log(colors.brightBlue(`\nCreating key: ${name}`));
  const key = password && salt
    ? await createKey(password, salt)
    : await genKey();
  try {
    await storeKey(filePath, key);
  } catch (err) {
    if (err instanceof Deno.errors.AlreadyExists) {
      console.log(
        colors.brightYellow(
          `${filePath} already exists. No changes have been made.`,
        ),
      );
      return;
    } else throw err;
  }
  console.log(colors.brightGreen("\nSuccess 🎉 🎊"));
  console.log(
    colors.brightGreen(`New key stored in: `) + colors.white(resolve(filePath)),
  );
}
