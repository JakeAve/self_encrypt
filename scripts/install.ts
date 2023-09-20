import { colors, Confirm, Input, resolve } from "../deps.ts";
import { addKey } from "./keys.ts";

const HOME = Deno.env.get("HOME") as string;
const MAIN_PATH = resolve(HOME, ".self_encrypt_🔐");
const KEYS = resolve(MAIN_PATH, "keys_🔑🔑");
const BIN = resolve(MAIN_PATH, "bin");
const SCRIPT_PATH = resolve(MAIN_PATH, "bin", "self_encrypt");

async function install() {
  if (Deno.build.os !== "darwin" || Deno.build.arch !== "aarch64") {
    // platforms: --target [ x86_64-unknown-linux-gnu, x86_64-pc-windows-msvc, x86_64-apple-darwin, aarch64-apple-darwin]
    throw new Error("Sorry this is only available on darwin aarch64 right now");
  }

  console.log(
    colors.brightWhite(`\nself_encrypt 🔐 will install in ${MAIN_PATH}`),
  );
  const shouldProceed = await Confirm.prompt("Should the installer proceeed?");
  if (!shouldProceed) {
    console.log(
      colors.brightYellow("Haulting installation. No files have been written."),
    );
    return;
  }
  const doesExist = await doesFolderExist();
  if (doesExist) {
    console.log(
      colors.brightYellow(
        "It looks like you already have self_encrypt 🔐 installed. Please uninstall it before reinstalling.",
      ),
    );
  }

  console.log(colors.brightBlue("Install beginning..."));
  await Deno.mkdir(MAIN_PATH);
  await Deno.mkdir(KEYS);
  await Deno.mkdir(BIN);

  const resp = await fetch(
    "https://raw.githubusercontent.com/JakeAve/self_encrypt/main/scripts/encryptFile.ts" as string,
  );

  const buff = await resp.arrayBuffer();

  await Deno.writeFile(SCRIPT_PATH, new Uint8Array(buff), { create: true });

  await appendToProfile();

  console.log(colors.brightGreen("✅ Installation successful 🎉 🎊"));

  const shouldCreateKey = await Confirm.prompt(
    "Would you like to create your first key?",
  );

  if (shouldCreateKey) {
    const shouldUsePassAndSalt = await Confirm.prompt(
      colors.brightWhite(
        'Would you like to use a password and salt to create a repeatable key? (Enter "n" to create a key at random)',
      ),
    );

    if (shouldUsePassAndSalt) {
      const password = await Input.prompt("Enter password:");
      const salt = await Input.prompt("Enter salt:");

      if (!password || !salt) {
        console.log(colors.brightYellow("Invalid password or salt"));
        console.log(colors.brightYellow("No key was created"));
        return;
      }
      await addKey({ dir: KEYS, salt, password }, "");
    } else {
      await addKey({ dir: KEYS }, "");
    }
  }
}

async function doesFolderExist() {
  try {
    const { isDirectory } = await Deno.stat(MAIN_PATH);
    if (isDirectory) {
      return true;
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
  }
  return true;
}

async function appendToProfile() {
  const profileString =
    `\n# self_encrypt\nexport SELF_ENCRYPT_INSTALL="${MAIN_PATH}"\nexport PATH="$SELF_ENCRYPT_INSTALL/bin:$PATH"`;
  const shell = Deno.env.get("SHELL");
  if (!shell) {
    console.log(colors.brightBlue("Could not detect your shell environment"));
    console.log(
      colors.brightBlue(
        "Copy and paste the following variables to your .zshrc, .bash_profile or similar",
      ),
    );
    console.log(profileString);
    return;
  }
  let profilePath = resolve(HOME, ".zshrc");
  if (shell.includes("zsh")) {
    profilePath = resolve(HOME, ".zshrc");
  } else if (shell.includes("bash")) {
    profilePath = resolve(HOME, ".bash_profile");
  }

  const profileFile = await Deno.open(profilePath, {
    write: true,
    append: true,
  });
  await profileFile.write(new TextEncoder().encode(profileString));
  profileFile.close();
}

if (import.meta.main) {
  install();
}
