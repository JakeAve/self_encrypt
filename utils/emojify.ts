export function emojify(input: string) {
  return input.replace(/\\u[0-9A-Fa-f]{1,8}/gi, (match) => {
    const hex = match.slice(2);
    const int = parseInt(hex, 16);
    return String.fromCodePoint(int);
  });
}
