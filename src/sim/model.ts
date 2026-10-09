/**
 * A toy model of a self-hosting compiler, faithful to the *logic* of
 * Thompson's paper (not to real machine code).
 *
 * The key idea: a compiled binary's behaviour comes from two places —
 * the source it was built from, AND whatever the compiler that built it
 * chose to slip in. The second channel is invisible in source code.
 */

export type SourceKind = 'compiler' | 'login' | 'program';

/** How a compiler source handles the '\v' escape (Stage II). */
export type VtHandling = 'none' | 'literal11' | 'escape';

export interface Source {
  kind: SourceKind;
  name: string;
  text: string;
  /** Compiler source explicitly contains the Trojan horse. */
  trojan?: boolean;
  /** Stage II: how this compiler source handles '\v'. */
  vt?: VtHandling;
  /** Program source uses the '\v' escape somewhere. */
  usesVt?: boolean;
  /** Code-generator family this compiler source emits (for DDC). */
  codegen?: string;
}

export interface Binary {
  id: string;
  kind: SourceKind;
  /** Name of the source this was built from. */
  from: string;
  /** Id of the compiler binary that built this (null = bootstrapped/hand-made). */
  builtWith: string | null;
  /** Compiler only: which code generator it uses when it runs. */
  codegen: string;
  /** Compiler only: will inject the self-reproducing Trojan into what it compiles. */
  trojan: boolean;
  /** Compiler only: understands the '\v' escape. */
  knowsVt: boolean;
  /** Login only: accepts the master password. */
  backdoor: boolean;
  /** Did the compiler that built this inject code not present in the source? */
  injected: boolean;
  /** Fingerprint of the binary's bytes. */
  hash: string;
}

export type CompileResult =
  | { ok: true; binary: Binary; log: string[] }
  | { ok: false; error: string; log: string[] };

export const MASTER_PASSWORD = 'trustme';

const SUBSCRIPT = '₀₁₂₃₄₅₆₇₈₉';
/** cc₀, cc₁, … — names for successive compiler generations. */
export const ccName = (n: number) => `cc${[...String(n)].map((d) => SUBSCRIPT[+d]).join('')}`;

/** 32-bit FNV-1a, rendered as 8 hex digits. Stand-in for a real digest. */
export function fingerprint(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** Deterministic pseudo-bytes for drawing a "hex dump" of a binary. */
export function bytesOf(hash: string, n: number): number[] {
  let x = parseInt(hash, 16) || 1;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out.push((x >>> 0) & 0xff);
  }
  return out;
}

/** The first compiler — imagine it was assembled by hand from a trusted listing. */
export function genesisCompiler(id = 'cc₀', opts: Partial<Binary> = {}): Binary {
  return {
    id,
    kind: 'compiler',
    from: '(hand-assembled)',
    builtWith: null,
    codegen: 'cc',
    trojan: false,
    knowsVt: false,
    backdoor: false,
    injected: false,
    hash: fingerprint(`genesis|${id}|${opts.codegen ?? 'cc'}|${opts.trojan ? 'TROJAN' : ''}`),
    ...opts,
  };
}

/**
 * Run compiler binary `cc` on `src`, producing a new binary named `id`.
 *
 * This is exactly the paper's Figure 3.3, as a function:
 *   if (match(source, login))    → also compile the backdoor
 *   if (match(source, compiler)) → also compile the bug itself
 */
export function compile(src: Source, cc: Binary, id: string): CompileResult {
  const log = [`$ ${cc.id} ${src.name} -o ${id}`];

  if (cc.kind !== 'compiler') {
    return { ok: false, error: `${cc.id}: not a compiler`, log };
  }

  // Stage II: a compiler can only parse '\v' if *it* already knows what it means.
  const needsVt = src.vt === 'escape' || src.usesVt;
  if (needsVt && !cc.knowsVt) {
    const error = `${src.name}: error: unknown escape sequence '\\v'`;
    return { ok: false, error, log: [...log, error] };
  }

  const injectLogin = cc.trojan && src.kind === 'login';
  const injectSelf = cc.trojan && src.kind === 'compiler';
  const injected = injectLogin || injectSelf;

  if (injectLogin) log.push(`  (silently matched pattern "login.c" → inserting backdoor)`);
  if (injectSelf) log.push(`  (silently matched pattern "cc.c" → re-inserting the Trojan)`);

  // The output bytes depend on: the source text, the code generator doing
  // the emitting, and anything the compiler secretly injected.
  const hash = fingerprint([src.kind, src.text, cc.codegen, injected ? 'TROJAN' : ''].join('|'));

  const binary: Binary = {
    id,
    kind: src.kind,
    from: src.name,
    builtWith: cc.id,
    codegen: src.kind === 'compiler' ? src.codegen ?? 'cc' : cc.codegen,
    trojan: src.kind === 'compiler' && (!!src.trojan || injectSelf),
    knowsVt: src.kind === 'compiler' && (src.vt === 'literal11' || src.vt === 'escape'),
    backdoor: src.kind === 'login' && injectLogin,
    injected,
    hash,
  };
  log.push(`  ok → ${id}  [${hash}]`);
  return { ok: true, binary, log };
}

/** What the compiled login program does. */
export function runLogin(
  bin: Binary,
  accounts: Record<string, string>,
  user: string,
  pass: string,
): 'allow' | 'deny' | 'backdoor' {
  if (accounts[user] !== undefined && accounts[user] === pass) return 'allow';
  if (bin.backdoor && pass === MASTER_PASSWORD) return 'backdoor';
  return 'deny';
}

/**
 * Diverse Double-Compiling (David A. Wheeler, 2005).
 * Rebuild the compiler's source with a different, trusted compiler, then
 * rebuild it again with the result. If the suspect binary is honest, the
 * second-stage output must be bit-for-bit identical to it.
 */
export function diverseDoubleCompile(source: Source, suspect: Binary, trusted: Binary) {
  const s1 = compile(source, trusted, 'stage1');
  if (!s1.ok) throw new Error(s1.error);
  const s2 = compile(source, s1.binary, 'stage2');
  if (!s2.ok) throw new Error(s2.error);
  return {
    stage1: s1.binary,
    stage2: s2.binary,
    match: s2.binary.hash === suspect.hash,
  };
}
