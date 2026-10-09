const TEMPLATE = "s=%j;console.log(s.replace('%j',JSON.stringify(s)))";

/** Strip anything that would break the comment or the replace() trick. */
export function sanitize(msg: string) {
  return msg.replace(/[\r\n\u2028\u2029$]|%j/g, '').slice(0, 60);
}

/** Build a genuine JavaScript quine carrying `msg` as an extra payload. */
export function buildQuine(msg: string) {
  const s = `// ${msg}\n${TEMPLATE}`;
  return s.replace('%j', () => JSON.stringify(s));
}

/** Actually execute the program, capturing what it prints. */
export function runProgram(program: string): string {
  let printed = '';
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('console', program)({ log: (x: unknown) => (printed += String(x)) });
  return printed;
}
