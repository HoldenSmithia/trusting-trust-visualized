import { describe, expect, it } from 'vitest';
import { compile, diverseDoubleCompile, genesisCompiler, runLogin, MASTER_PASSWORD, type Binary } from './model';
import { ccSource, loginSource, vtSource } from './sources';

function mustCompile(...args: Parameters<typeof compile>): Binary {
  const r = compile(...args);
  if (!r.ok) throw new Error(r.error);
  return r.binary;
}

describe('Stage II: teaching the compiler \\v', () => {
  it('cannot compile the escape form with a compiler that does not know \\v', () => {
    expect(compile(vtSource('escape'), genesisCompiler(), 'x').ok).toBe(false);
  });

  it('learns \\v via the literal 11, then can compile the escape form', () => {
    const cc1 = mustCompile(vtSource('literal11'), genesisCompiler(), 'cc1');
    expect(cc1.knowsVt).toBe(true);
    const cc2 = mustCompile(vtSource('escape'), cc1, 'cc2');
    expect(cc2.knowsVt).toBe(true);
  });
});

describe('Stage III: the self-reproducing Trojan', () => {
  const accounts = { student: 'student' };

  it('survives removal from the source', () => {
    const evil = mustCompile(ccSource(true), genesisCompiler(), 'cc1');
    const fromCleanSource = mustCompile(ccSource(false), evil, 'cc2');
    expect(fromCleanSource.trojan).toBe(true);
    expect(mustCompile(ccSource(false), fromCleanSource, 'cc3').trojan).toBe(true);
  });

  it('backdoors login only when built by an infected compiler', () => {
    const clean = mustCompile(loginSource, genesisCompiler(), 'login');
    expect(runLogin(clean, accounts, 'root', MASTER_PASSWORD)).toBe('deny');

    const evil = mustCompile(ccSource(true), genesisCompiler(), 'cc1');
    const bad = mustCompile(loginSource, evil, 'login');
    expect(runLogin(bad, accounts, 'root', MASTER_PASSWORD)).toBe('backdoor');
    expect(runLogin(bad, accounts, 'student', 'student')).toBe('allow');
  });
});

describe('Diverse Double-Compiling', () => {
  const trusted = genesisCompiler('tcc', { codegen: 'tcc' });

  it('reproduces an honest self-hosted compiler bit-for-bit', () => {
    const honest = mustCompile(ccSource(false), mustCompile(ccSource(false), genesisCompiler(), 'a0'), 'A');
    expect(diverseDoubleCompile(ccSource(false), honest, trusted).match).toBe(true);
  });

  it('exposes a compiler carrying the Trojan', () => {
    const infected0 = mustCompile(ccSource(true), genesisCompiler(), 'a0');
    const suspect = mustCompile(ccSource(false), infected0, 'A');
    expect(diverseDoubleCompile(ccSource(false), suspect, trusted).match).toBe(false);
  });
});
