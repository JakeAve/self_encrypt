import {
  decrypt,
  decryptFile,
  encrypt,
  encryptFile,
} from "./encryptAndDecrypt.ts";
import { genKey } from "./genKey.ts";

Deno.bench(async function encryptSmallMessage(b) {
  const key = await genKey();
  const message = "hello";
  const data = new TextEncoder().encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  b.start();
  await encrypt(data, key, iv);
  b.end();
});

Deno.bench(async function decryptSmallMessage(b) {
  const key = await genKey();
  const message = "hello";
  const data = new TextEncoder().encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await encrypt(data, key, iv);
  b.start();
  await decrypt(encryptedData, key, iv);
  b.end();
});

const encryptAndDecryptFile = async (
  filePath: string,
  b: Deno.BenchContext,
  type: "enc" | "dec",
) => {
  const key = await genKey();
  const [[tempFile, tempFilePath], mainFile] = await Promise.all([
    Deno.makeTempFile({ prefix: "temp-", dir: "./test_utils" }).then(
      (tempFilePath) =>
        Promise.all([
          Deno.open(tempFilePath, { write: true, read: true }),
          tempFilePath,
        ]),
    ),
    Deno.open(filePath, { write: true, read: true }),
  ]);

  if (type === "enc") b.start();
  await encryptFile(mainFile, tempFile, key);
  if (type === "enc") b.end();

  await Promise.all([
    tempFile.seek(0, Deno.SeekMode.Start),
    mainFile.seek(0, Deno.SeekMode.Start),
  ]);

  if (type === "dec") b.start();
  await decryptFile(tempFile, mainFile, key);
  if (type === "dec") b.end();

  tempFile.close();
  mainFile.close();

  await Deno.remove(tempFilePath);
};

const LARGE_TEXT_FILE_PATH = "./test_utils/test.txt";

Deno.bench(async function encryptTextFile(b) {
  await encryptAndDecryptFile(LARGE_TEXT_FILE_PATH, b, "enc");
});

Deno.bench(async function decryptTextFile(b) {
  await encryptAndDecryptFile(LARGE_TEXT_FILE_PATH, b, "dec");
});

const IMAGE_FILE_PATH = "./test_utils/lock-pic.jpeg";

Deno.bench(async function encrypt2MBImageFile(b) {
  await encryptAndDecryptFile(IMAGE_FILE_PATH, b, "enc");
});

Deno.bench(async function decrypt2MBImageFile(b) {
  await encryptAndDecryptFile(IMAGE_FILE_PATH, b, "dec");
});

const PDF_FILE_PATH = "./test_utils/AES.pdf";

Deno.bench(async function encrypt1MBPdfFile(b) {
  await encryptAndDecryptFile(PDF_FILE_PATH, b, "enc");
});

Deno.bench(async function decrypt1MBPdfFile(b) {
  await encryptAndDecryptFile(PDF_FILE_PATH, b, "dec");
});
