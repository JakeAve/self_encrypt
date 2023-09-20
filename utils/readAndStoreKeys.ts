import { dirname } from "../deps.ts";

export async function storeKey(filePath: string, key: CryptoKey) {
  const raw = await crypto.subtle.exportKey("raw", key);
  const bytes = new Uint8Array(raw);
  try {
    await Deno.writeFile(filePath, bytes, { createNew: true });
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      const dir = dirname(filePath);
      await Deno.mkdir(dir, { recursive: true });
      await Deno.writeFile(filePath, bytes);
    } else throw err;
  }
}

export async function readKey(filePath: string) {
  const bytes = await Deno.readFile(filePath);
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}
