import { describe, expect, it } from 'vitest';
import { buildQuine, runProgram, sanitize } from './quine';

describe('Stage I quine', () => {
  const payloads = ['Hello from inside the DNA', '', 'quotes " and \' and \ backslash', 'emoji 🐴 and `ticks`', '$& $1 %j\nnew\u2028line'];

  it.each(payloads)('reproduces itself exactly with payload %j', (p) => {
    const program = buildQuine(sanitize(p));
    expect(runProgram(program)).toBe(program);
  });

  it('is a fixed point across generations', () => {
    let program = buildQuine('gen');
    for (let i = 0; i < 5; i++) program = runProgram(program);
    expect(program).toBe(buildQuine('gen'));
  });
});
