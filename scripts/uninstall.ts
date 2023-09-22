import { colors, Input } from "../deps.ts";

const MAIN_PATH = Deno.env.get("SELF_ENCRYPT_INSTALL");

const CONFIRMATION_TEXT = "destroy my keys";

export async function uninstall() {
  try {
    await Deno.remove(MAIN_PATH as string, { recursive: true });
    console.log(colors.brightGreen("Successfully uninstalled"));
  } catch (err) {
    console.error(
      colors.brightYellow(`The uninstall failed because of ${err}`),
    );
  }
}

if (import.meta.main) {
  if (!MAIN_PATH) {
    throw new Error("Could not find .self_encrypt_🔐 path");
  }
  const shouldProceed = await Input.prompt(
    colors.brightYellow(
      `Uninstalling will delete all of the keys associated with self_encrypt. If you want to proceed type "${CONFIRMATION_TEXT}" Would you like to proceed?`,
    ),
  );

  if (shouldProceed !== CONFIRMATION_TEXT) {
    throw new Error("Halting uninstall. Nothing was deleted.");
  }
  uninstall();
}
