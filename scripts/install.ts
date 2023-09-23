import { colors, Confirm, loadEnv, resolve } from "../deps.ts";
import { uninstall } from "./uninstall.ts";

await loadEnv({ export: true });

const PATH = Deno.env.get("ENV_DEFINED_INSTALL_PATH") as string;
const EXE_NAME = Deno.env.get("EXECUTABLE_NAME") as string;
const VAR_NAME = Deno.env.get("INSTALL_PATH_VARIABLE_NAME") as string;
const HOME = Deno.env.get("HOME") as string;

const INSTALL_PATH = resolve(HOME, PATH);
const KEYS = resolve(INSTALL_PATH, "keys_🔑🔑");
const BIN = resolve(INSTALL_PATH, "bin");
const SCRIPT_PATH = resolve(INSTALL_PATH, "bin", EXE_NAME);
const UNINSTALL_PATH = resolve(INSTALL_PATH, "bin", "uninstall");

async function install() {
  try {
    if (Deno.build.os !== "darwin" || Deno.build.arch !== "aarch64") {
      // platforms: --target [ x86_64-unknown-linux-gnu, x86_64-pc-windows-msvc, x86_64-apple-darwin, aarch64-apple-darwin]
      throw new Error(
        "Sorry this is only available on darwin aarch64 right now",
      );
    }

    console.log(
      colors.brightWhite(`\nself_encrypt 🔐 will install in ${INSTALL_PATH}`),
    );
    const shouldProceed = await Confirm.prompt("Should the installer proceed?");
    if (!shouldProceed) {
      console.log(
        colors.brightYellow(
          "Halting installation. No files have been written.",
        ),
      );
      return;
    }
    const doesExist = await doesFolderExist();
    if (doesExist) {
      throw new Error(
        "It looks like you already have self_encrypt 🔐 installed. Please uninstall it before reinstalling.",
      );
    }

    console.log(colors.brightBlue("Install beginning..."));
    console.log(colors.brightBlue("Making directories..."));
    await Deno.mkdir(INSTALL_PATH);
    await Deno.mkdir(KEYS);
    await Deno.mkdir(BIN);

    console.log(colors.brightBlue("Finding binaries on GitHub..."));
    const selfEncryptResp = await fetch(
      "https://github.com/JakeAve/self_encrypt/releases/latest/download/self_encrypt_aarch64-apple-darwin.raw",
    );

    if (!selfEncryptResp.ok) {
      throw new Error(
        `Could now download ${selfEncryptResp.url}. Try downloading manually.`,
      );
    }

    console.log(colors.brightBlue("Buffering..."));
    const selfEncryptBuff = await selfEncryptResp.arrayBuffer();

    console.log(colors.brightBlue("Creating executable..."));
    await Deno.writeFile(SCRIPT_PATH, new Uint8Array(selfEncryptBuff), {
      create: true,
    });

    await Deno.chmod(SCRIPT_PATH, 0o755);

    await appendToProfile();

    console.log(
      colors.brightBlue("Finding binaries for uninstaller on GitHub..."),
    );
    const uninstallerResp = await fetch(
      "https://github.com/JakeAve/self_encrypt/releases/latest/download/uninstall_aarch64-apple-darwin.raw",
    );

    if (!uninstallerResp.ok) {
      throw new Error(
        `Could now download ${uninstallerResp.url}. Try downloading manually.`,
      );
    }

    console.log(colors.brightBlue("Buffering..."));
    const uninstallerBuff = await uninstallerResp.arrayBuffer();

    console.log(colors.brightBlue("Creating executable..."));
    await Deno.writeFile(UNINSTALL_PATH, new Uint8Array(uninstallerBuff), {
      create: true,
    });

    await Deno.chmod(UNINSTALL_PATH, 0o755);

    console.log(colors.brightGreen("✅ Installation successful 🎉 🎊"));

    console.log(
      colors.brightWhite(
        `\nRefresh your terminal using ${
          colors.bold(
            "zsh/bash/sh",
          )
        } to start using self_encrypt 🔐.\nYou can create your first key using:`,
      ),
    );
    console.log(colors.bold(colors.brightWhite(`${EXE_NAME} keys gen`)));
  } catch (err) {
    console.log(
      colors.brightYellow(
        "Ran into an error. Attempting to undo all install progress...",
      ),
    );
    const doesExist = await doesFolderExist();
    if (doesExist) {
      await uninstall();
    }
    console.log(colors.brightGreen("Done."));
    console.log(
      colors.brightYellow("See the error below to see why the install failed"),
    );
    throw err;
  }
}

async function doesFolderExist() {
  try {
    const { isDirectory } = await Deno.stat(INSTALL_PATH);
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
    `\n\n# self_encrypt\nexport ${VAR_NAME}="${INSTALL_PATH}"\nexport PATH="$${VAR_NAME}/bin:$PATH"`;
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
