import { colors, resolve } from "../deps.ts";

const HOME = Deno.env.get("HOME") as string;
const MAIN_PATH = resolve(HOME, ".self_encrypt_🔐");

async function uninstall() {
  const shouldProceed = confirm(
    colors.brightYellow(
      "Uninstalling will delete all of the keys associated with self_encrypt. Would you like to proceed?",
    ),
  );
  if (!shouldProceed) {
    console.log(
      colors.brightYellow("Haulting uninstallation. Nothing was uninstalled."),
    );
    return;
  }
  try {
    await Deno.remove(MAIN_PATH, { recursive: true });
    console.log(colors.brightGreen("Successfully uninstalled"));
  } catch (err) {
    console.error(
      colors.brightYellow(`The uninstallation failed because of ${err}`),
    );
  }
}

if (import.meta.main) {
  uninstall();
}
