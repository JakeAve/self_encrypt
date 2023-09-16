import {
  iterateReader,
  readerFromStreamReader,
  writeAll,
} from "$std/streams/mod.ts";

const BUFF_SIZE = 32768;
const IV_BYTE_LENGTH = 12;
const GCM_TAG_BYTE_LENGTH = 16;

export async function encrypt(
  input: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array,
) {
  const bytes = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    input,
  );
  return new Uint8Array(bytes);
}

export async function encryptFile(
  unencryptedFile: Deno.FsFile,
  encryptedFile: Deno.FsFile,
  key: CryptoKey,
) {
  // const stream = encryptStream(unencryptedFile.readable, key);
  // const reader = readerFromStreamReader(stream.getReader());

  // for await (const chunk of iterateReader(reader, {
  //   bufSize: BUFF_SIZE,
  // })) {
  //   await writeAll(encryptedFile, chunk);
  // }
  // encryptedFile.close();

  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTE_LENGTH));
  await writeAll(encryptedFile, iv);

  for await (
    const chunk of iterateReader(unencryptedFile, {
      bufSize: BUFF_SIZE,
    })
  ) {
    const encryptedChunk = await encrypt(chunk, key, iv);
    await writeAll(encryptedFile, encryptedChunk);
  }
}

export async function encryptFileFromStream(
  unencryptedFile: Deno.FsFile,
  encryptedFile: Deno.FsFile,
  key: CryptoKey,
) {
  const stream = encryptStream(unencryptedFile.readable, key);
  const reader = readerFromStreamReader(stream.getReader());

  for await (
    const chunk of iterateReader(reader, {
      bufSize: BUFF_SIZE,
    })
  ) {
    await writeAll(encryptedFile, chunk);
  }
  encryptedFile.close();
}

export function encryptStream(
  inputStream: ReadableStream<Uint8Array>,
  key: CryptoKey,
) {
  const reader = readerFromStreamReader(inputStream.getReader());
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTE_LENGTH));
  const outputSteam = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(iv);
      for await (
        const chunk of iterateReader(reader, {
          bufSize: BUFF_SIZE,
        })
      ) {
        const encryptedChunk = await encrypt(chunk, key, iv);
        controller.enqueue(encryptedChunk);
      }
      controller.close();
    },
  });

  return outputSteam;
}

export async function decrypt(
  input: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array,
) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    input,
  );
  return new Uint8Array(decrypted);
}

export async function decryptFile(
  encryptedFile: Deno.FsFile,
  decryptedFile: Deno.FsFile,
  key: CryptoKey,
) {
  const iv = new Uint8Array(IV_BYTE_LENGTH);
  await Promise.all([
    encryptedFile.read(iv),
    encryptedFile.seek(IV_BYTE_LENGTH, Deno.SeekMode.Start),
  ]);

  for await (
    const chunk of iterateReader(encryptedFile, {
      bufSize: BUFF_SIZE + GCM_TAG_BYTE_LENGTH,
    })
  ) {
    const decryptedChunk = await decrypt(chunk, key, iv);
    await writeAll(decryptedFile, decryptedChunk);
  }
}

export function decryptStream(
  inputStream: ReadableStream<Uint8Array>,
  key: CryptoKey,
) {
  const reader = readerFromStreamReader(inputStream.getReader());
  const outputSteam = new ReadableStream<Uint8Array>({
    async start(controller) {
      const iv = new Uint8Array(IV_BYTE_LENGTH);
      reader.read(iv);

      for await (
        const chunk of iterateReader(reader, {
          bufSize: BUFF_SIZE + GCM_TAG_BYTE_LENGTH,
        })
      ) {
        const decryptedChunk = await decrypt(chunk, key, iv);
        controller.enqueue(decryptedChunk);
      }
      controller.close();
    },
  });

  return outputSteam;
}

export async function decryptFileUsingStream(
  encryptedFile: Deno.FsFile,
  decryptedFile: Deno.FsFile,
  key: CryptoKey,
) {
  const stream = decryptStream(encryptedFile.readable, key);
  const reader = readerFromStreamReader(stream.getReader());

  for await (
    const chunk of iterateReader(reader, {
      bufSize: BUFF_SIZE,
    })
  ) {
    await writeAll(decryptedFile, chunk);

    decryptedFile.close();
  }
}
