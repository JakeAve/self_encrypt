import { assertEquals } from "$std/assert/assert_equals.ts";
import { stringifyYAML } from "../deps.ts";
import { emojify } from "./emojify.ts";

Deno.test("Emojify works", () => {
  const obj = {
    foo: ["😁", "😆", "🙂‍↔️", "🥳", "🤵‍♂️"],
  };
  const stringified = stringifyYAML(obj);
  const emojified = emojify(stringified);
  const expected = `foo:
  - "😁"
  - "😆"
  - "🙂‍↔️"
  - "🥳"
  - "🤵‍♂️"\n`;
  assertEquals(emojified, expected);
});
