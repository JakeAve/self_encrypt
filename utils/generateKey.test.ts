import { assert } from "$std/assert/assert.ts";
import { generateKey } from "./generateKey.ts";
import { assertSpyCalls, returnsNext, stub } from "$std/testing/mock.ts";
import { EncDecScriptHelper } from "./EncDecScriptHelper.ts";
import { assertRejects } from "$std/assert/assert_rejects.ts";

const LARGE_TEXT_FILE_PATH = "./test_utils/test.txt";

Deno.test("generateKey works", async () => {
  const path = "./test_utils/foo.key";
  await generateKey({
    name: "foo",
    password: "bar",
    salt: "fizz",
    dir: "./test_utils",
  });
  await EncDecScriptHelper(LARGE_TEXT_FILE_PATH, path, "encrypt");
  await EncDecScriptHelper(LARGE_TEXT_FILE_PATH, path, "decrypt");
  assert(true);
  await Deno.remove(path);
});

Deno.test("generateKey works with no args", async () => {
  const writeFileStub = stub(
    Deno,
    "writeFile",
    returnsNext([Promise.resolve(undefined)]),
  );
  try {
    await generateKey();
  } finally {
    writeFileStub.restore();
  }

  assertSpyCalls(writeFileStub, 1);
});

Deno.test(
  "generateKey throws errors on password and no salt and vice versa",
  async () => {
    const writeFileStub = stub(
      Deno,
      "writeFile",
      returnsNext([Promise.resolve(undefined)]),
    );

    assertRejects(() => generateKey({ password: "foo" }));
    assertRejects(() => generateKey({ salt: "foo" }));

    assertSpyCalls(writeFileStub, 0);

    try {
      await generateKey({ password: "foo", salt: "bar" });
    } finally {
      writeFileStub.restore();
    }

    assertSpyCalls(writeFileStub, 1);
  },
);
