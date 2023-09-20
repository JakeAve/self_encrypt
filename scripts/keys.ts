import {
  colors,
  Command,
  Confirm,
  Input,
  parseYAML,
  resolve,
  Select,
  stringifyYAML,
  Table,
} from "../deps.ts";
import { generateKey } from "../utils/generateKey.ts";
import { emojify } from "../utils/emojify.ts";
import { brightYellow } from "$std/fmt/colors.ts";
import { makeRandomName } from "../utils/makeRandomName.ts";

const MAIN_PATH = Deno.env.get("SELF_ENCRYPT_INSTALL");
if (!MAIN_PATH) {
  throw new Error("Could not find .self_encrypt_🔐 path");
}
const KEYS = resolve(MAIN_PATH, "keys_🔑🔑");
const KEYS_META = resolve(MAIN_PATH, "keys_meta");

export const keys = new Command()
  .description("Manage crypto keys in self_encrypt")
  .action(() => listKeys())
  .command(
    "gen",
    "Save a crypto key to a .key file. Includes options to change the dir, add a password and a salt.",
  )
  .option("-p, --password <password>", "Password for key")
  .option("-s, --salt <salt>", "Salt for key")
  .option("-d, --dir <dir>", `Path to folder where you want the key`, {
    default: resolve(KEYS),
  })
  .arguments("[key_name:string]")
  .action(addKey)
  .command("list", "List discoverable keys available in self_encrypt")
  .action(() => listKeys())
  .command("rm", "Delete a key from self_encrypt")
  .arguments("<key_name:string>")
  .action((_options, ...args) => {
    removeKey(args[0]);
  });

interface KeyProperties {
  name: string;
  path: string;
  algorithm?: string;
  length: number;
  created_at: Date | null;
  notes?: string;
}

interface KeysYaml {
  keys: KeyProperties[];
}

async function listKeys() {
  const keys = await getKeys();
  const table = Table.from(
    keys.map(({ name, created_at, algorithm, length, notes }) => [
      name,
      created_at ? new Date(created_at).toISOString() : "",
      algorithm || "",
      length,
      notes || "",
    ]),
  );
  table
    .header(["name", "created_at", "algorithm", "length", "notes"])
    .maxColWidth(20)
    .border()
    .render();
}

export async function getKeys() {
  const savedKeys: KeyProperties[] = [];
  for await (const entry of Deno.readDir(KEYS)) {
    const path = resolve(KEYS, entry.name);
    const name = entry.name.replace(/\.key$/, "");
    const fileInfo = await Deno.lstat(path);
    const { birthtime: created_at, size } = fileInfo;
    savedKeys.push({ name, path, created_at, length: size * 8 });
  }

  const keysYaml = await readYaml();

  for (const key of savedKeys) {
    const { path, created_at, length } = key;
    let addAsNewKey = true;
    keysYaml.keys.forEach((k) => {
      if (k.path === path) {
        addAsNewKey = false;
        k.created_at = created_at;
        k.length = length;
      }
    });
    if (addAsNewKey) keysYaml.keys.push(key);
  }

  keysYaml.keys.forEach((key, index) => {
    const keyIsAccountedFor = savedKeys.find(({ path }) => path === key.path);
    if (!keyIsAccountedFor) {
      try {
        const { birthtime, size } = Deno.lstatSync(key.path);
        key.created_at = birthtime;
        key.length = size * 8;
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
          keysYaml.keys.splice(index, 1);
        } else throw err;
      }
    }
  });

  await storeYaml(keysYaml);

  return keysYaml.keys;
}

async function addToYaml(keyInfo: KeyProperties) {
  const keysYaml = await readYaml();
  keysYaml.keys.push(keyInfo);
  await storeYaml(keysYaml);
}

async function readYaml() {
  try {
    const yaml = await Deno.readTextFile(KEYS_META);
    return parseYAML(yaml) as KeysYaml;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return { keys: [] } as KeysYaml;
    } else throw err;
  }
}

async function storeYaml(data: KeysYaml) {
  const newContent = stringifyYAML(data as unknown as Record<string, unknown>);
  // todo: Maybe update the deno std yaml stringify?
  const withEmojis = emojify(newContent);
  const disclaimer =
    `# This file only exists for convenience\n# It should be managed with care because certain values like "notes" and "algothims" once altered, cannot be recovered\n`;
  await Deno.writeTextFile(KEYS_META, disclaimer + withEmojis);
}

async function removeKey(name: string) {
  const shouldContinue = await Confirm.prompt(
    "This will permanently remove the key. There will not be a way to recover the file. Do you want to continue?",
  );
  if (!shouldContinue) {
    console.log(colors.brightYellow("Aborting. Nothing was deleted."));
    return;
  }
  const { keys } = await readYaml();
  let pathToRemove = "";
  const matching = keys.filter((k) => k.name === name);
  if (matching.length > 1) {
    const selected = await Select.prompt({
      message: "Which key is the one you want to remove?",
      options: matching.map(({ name, path }) => ({ name, value: path })),
    });
    pathToRemove = selected.value;
  }
  if (!matching.length) {
    console.log(brightYellow(`No key is named ${name}`));
  }
  if (matching.length === 1) {
    pathToRemove = matching[0].path;
  }

  await Deno.remove(pathToRemove);
  console.log("Key removed successfully");
}

export async function addKey(
  options: {
    password?: string | undefined;
    salt?: string | undefined;
    dir: string;
  },
  ...args: [(string | undefined)?]
) {
  const { password, salt, dir } = options;
  let [name] = args;

  if (!name) {
    name = await Input.prompt(
      "Enter the name for the key (leave blank to generate a unique name):",
    );
  }

  if (!name) {
    name = makeRandomName();
  }

  const path = (await generateKey({ name, password, salt, dir })) as string;
  await addToYaml({
    name,
    path: resolve(Deno.cwd(), path),
    algorithm: "AES-GCM",
    length: 256,
    created_at: new Date(),
  });
}
