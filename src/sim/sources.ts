import type { Source } from './model';

/** One line of displayed code; `tone` drives highlighting. */
export interface CodeLine {
  text: string;
  tone?: 'evil' | 'added' | 'ghost' | 'dim';
}

const L = (text: string, tone?: CodeLine['tone']): CodeLine => ({ text, tone });

/* ---------------- Stage II: the '\v' escape ---------------- */

const escapeHead = [
  L('/* lexer.c — part of the C compiler, written in C */'),
  L('c = next();'),
  L("if (c != '\\\\')"),
  L('    return c;'),
  L('c = next();'),
  L("if (c == '\\\\')"),
  L("    return '\\\\';"),
  L("if (c == 'n')"),
  L("    return '\\n';"),
];

export const vtVariants = {
  none: {
    label: 'Original (no \\v)',
    lines: escapeHead,
  },
  escape: {
    label: "Add: return '\\v';",
    lines: [...escapeHead, L("if (c == 'v')", 'added'), L("    return '\\v';", 'added')],
  },
  literal11: {
    label: 'Add: return 11;',
    lines: [...escapeHead, L("if (c == 'v')", 'added'), L('    return 11;   /* ASCII VT */', 'added')],
  },
} as const;

export type VtVariant = keyof typeof vtVariants;

export function vtSource(v: VtVariant): Source {
  return {
    kind: 'compiler',
    name: 'cc.c',
    text: vtVariants[v].lines.map((l) => l.text).join('\n'),
    vt: v,
  };
}

/* ---------------- Stage III: the Trojan horse ---------------- */

export const ccCleanLines: CodeLine[] = [
  L('/* cc.c — the C compiler, written in C */'),
  L('void compile(char *s)'),
  L('{'),
  L('    Program p = parse(s);'),
  L('    emit(codegen(p));'),
  L('}'),
];

export const ccTrojanLines: CodeLine[] = [
  L('/* cc.c — the C compiler, written in C */'),
  L('void compile(char *s)'),
  L('{'),
  L('    if (match(s, "pattern of login.c")) {', 'evil'),
  L('        compile("bug #1: accept master password");', 'evil'),
  L('        return;', 'evil'),
  L('    }', 'evil'),
  L('    if (match(s, "pattern of cc.c")) {', 'evil'),
  L('        compile("bug #2: re-insert bugs #1 and #2");', 'evil'),
  L('        return;', 'evil'),
  L('    }', 'evil'),
  L('    Program p = parse(s);'),
  L('    emit(codegen(p));'),
  L('}'),
];

/** What the compiler binary "really does" when X-rayed (disassembly-ish). */
export function ccXrayLines(trojan: boolean): CodeLine[] {
  if (!trojan) return ccCleanLines.map((l) => ({ ...l, tone: 'dim' as const }));
  return [
    L('; disassembly of the installed cc binary', 'dim'),
    L('compile:', 'dim'),
    L('    call match, s, <login.c fingerprint>', 'ghost'),
    L('    jnz  inject_backdoor', 'ghost'),
    L('    call match, s, <cc.c fingerprint>', 'ghost'),
    L('    jnz  inject_self      ; <- reproduces itself', 'ghost'),
    L('    call parse, s', 'dim'),
    L('    call codegen', 'dim'),
    L('    ret', 'dim'),
  ];
}

export const loginLines: CodeLine[] = [
  L('/* login.c — checks your password */'),
  L('int login(char *user, char *pass)'),
  L('{'),
  L('    struct passwd *pw = getpwnam(user);'),
  L('    if (pw == NULL)'),
  L('        return DENY;'),
  L('    if (strcmp(crypt(pass, pw->salt), pw->hash) == 0)'),
  L('        return ALLOW;'),
  L('    return DENY;'),
  L('}'),
];

export function loginXrayLines(backdoor: boolean): CodeLine[] {
  const body = loginLines.map((l) => ({ ...l, tone: 'dim' as const }));
  if (!backdoor) return body;
  return [
    ...body.slice(0, 3),
    L('    if (strcmp(pass, "trustme") == 0)   /* in NO source file */', 'ghost'),
    L('        return ALLOW;', 'ghost'),
    ...body.slice(3),
  ];
}

export function ccSource(trojan: boolean): Source {
  const lines = trojan ? ccTrojanLines : ccCleanLines;
  return { kind: 'compiler', name: 'cc.c', text: lines.map((l) => l.text).join('\n'), trojan, codegen: 'cc' };
}

export const loginSource: Source = {
  kind: 'login',
  name: 'login.c',
  text: loginLines.map((l) => l.text).join('\n'),
};
