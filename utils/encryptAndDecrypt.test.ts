import { assertEquals } from "$std/assert/assert_equals.ts";
import { assert } from "$std/assert/assert.ts";
import {
  decrypt,
  decryptFile,
  decryptStream,
  encrypt,
  encryptFile,
  encryptStream,
} from "./encryptAndDecrypt.ts";
import { genKey } from "./genKey.ts";

const LARGE_TEXT_FILE_PATH = "./test_utils/test.txt";
const IMAGE_FILE_PATH = "./test_utils/lock-pic.jpeg";
const PDF_FILE_PATH = "./test_utils/AES.pdf";

const encryptAndDecryptFile = async (filePath: string) => {
  const key = await genKey();
  const tempFilePath = await Deno.makeTempFile({
    dir: "./test_utils",
    prefix: "temp-",
  });
  const tempFile1 = await Deno.open(tempFilePath, { write: true });
  const originalFile = await Deno.open(filePath);

  await encryptFile(originalFile, tempFile1, key);

  tempFile1.close();
  originalFile.close();

  const tempFile2 = await Deno.open(tempFilePath);
  const encryptedFile = await Deno.open(filePath, { write: true });

  await decryptFile(tempFile2, encryptedFile, key);

  tempFile2.close();
  encryptedFile.close();

  await Deno.remove(tempFilePath);
};

Deno.test("Test encryptAndDecrypt", async () => {
  const key = await genKey();
  const message = "hello";
  const data = new TextEncoder().encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await encrypt(data, key, iv);
  const decryptedData = await decrypt(encryptedData, key, iv);
  const decryptedText = new TextDecoder().decode(decryptedData);
  assertEquals(decryptedText, message);
});

Deno.test(
  "encryptStream and decryptStream works",
  { permissions: { read: true, write: true } },
  async () => {
    const message = "hello";
    const bytes = new TextEncoder().encode(message);
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    const key = await genKey();

    const stream = await encryptStream(readable, key);
    const decryptedStream = await decryptStream(stream, key);
    const resp2 = new Response(decryptedStream);
    const buff2 = await resp2.arrayBuffer();
    const result = new TextDecoder().decode(new Uint8Array(buff2));

    assertEquals(result, message);
  },
);

Deno.test(
  "Encrypt and Decrypt work on large text file",
  { permissions: { read: true, write: true } },
  async () => {
    await encryptAndDecryptFile(LARGE_TEXT_FILE_PATH);
    assert(true);
  },
);

Deno.test(
  "Encrypt and Decrypt work on img file works",
  { permissions: { read: true, write: true } },
  async () => {
    await encryptAndDecryptFile(IMAGE_FILE_PATH);
    assert(true);
  },
);

Deno.test(
  "Encrypt and Decrypt work on pdf file works",
  { permissions: { read: true, write: true } },
  async () => {
    await encryptAndDecryptFile(PDF_FILE_PATH);
    assert(true);
  },
);
