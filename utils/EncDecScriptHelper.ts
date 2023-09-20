import { colors, dirname, resolve } from "../deps.ts";
import { readKey } from "../utils/readAndStoreKeys.ts";
import * as mainFunc from "../utils/encryptAndDecrypt.ts";

interface EncDecScriptHelperOptions {
  logSuccess: boolean;
}

export async function EncDecScriptHelper(
  filePath: string,
  keyPathOrKey: string | CryptoKey,
  mode: "encrypt" | "decrypt",
  options: EncDecScriptHelperOptions = { logSuccess: false },
) {
  const fileDir = dirname(filePath);

  let key = keyPathOrKey;

  if (keyPathOrKey instanceof CryptoKey) {
    key = keyPathOrKey;
  } else {
    key = (await readKey(keyPathOrKey).catch((err) => {
      if (err instanceof Deno.errors.NotFound) {
        console.log(colors.brightYellow(`Key: ${keyPathOrKey} not found.`));
        return;
      }
      throw err;
    })) as CryptoKey;
  }

  const tempFilePath = await Deno.makeTempFile({
    dir: fileDir,
    prefix: "temp-",
  });
  const tempFile = await Deno.open(tempFilePath, { write: true });
  const originalFile = await Deno.open(filePath);

  try {
    const funcName = (mode + "File") as "encryptFile" | "decryptFile";
    await mainFunc[funcName](originalFile, tempFile, key);
    originalFile.close();
    tempFile.close();
  } catch (err) {
    console.log(colors.brightYellow(`An error was thrown. Aborting. ${err}`));
    await Deno.remove(tempFilePath);
    throw err;
  }

  try {
    await Deno.rename(tempFilePath, filePath);
  } catch (err) {
    console.log(
      colors.brightYellow(
        `The file was successfully ${mode}ed, but an error was thrown. ${err}`,
      ),
    );
    console.log(colors.brightYellow(`Check contents in the following files:`));
    console.log(colors.white(resolve(filePath)));
    console.log(colors.white(resolve(tempFilePath)));
    throw err;
  }

  if (options.logSuccess) {
    console.log(colors.brightGreen(`Successful ${mode}ion!! 🎉🎊🎉🎊`));
    const keyText = keyPathOrKey instanceof CryptoKey
      ? JSON.stringify(keyPathOrKey.algorithm)
      : resolve(keyPathOrKey);
    console.log(
      colors.brightGreen(`The file: `) +
        colors.white(resolve(filePath)) +
        colors.brightGreen(` was ${mode}ed 🔐 using the key: `) +
        colors.white(keyText),
    );
  }
}
