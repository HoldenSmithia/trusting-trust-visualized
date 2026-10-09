import { useState, type FormEvent } from 'react';
import { ccName, compile, genesisCompiler, MASTER_PASSWORD, runLogin, type Binary } from '../sim/model';
import { ccSource, ccTrojanLines, ccCleanLines, ccXrayLines, loginLines, loginSource, loginXrayLines } from '../sim/sources';
import { CodeBlock } from './CodeBlock';
import { Callout, HexDump, Pill, Section, Term } from './ui';

const ACCOUNTS: Record<string, string> = { student: 'student', root: 'k9$Vq!x7#not-guessable' };

type Milestone = 'plant' | 'install' | 'erase' | 'rebuild' | 'login' | 'pwn';
const STEPS: { id: Milestone; text: string }[] = [
  { id: 'plant', text: 'Edit cc.c: insert the Trojan' },
  { id: 'install', text: 'Compile cc.c and install the infected compiler' },
  { id: 'erase', text: 'Remove the Trojan from cc.c (destroy the evidence)' },
  { id: 'rebuild', text: 'Recompile the now-clean cc.c' },
  { id: 'login', text: 'Compile the (perfectly clean) login.c' },
  { id: 'pwn', text: `Log in as root with password "${MASTER_PASSWORD}"` },
];

export function TrojanLab() {
  const [evilSrc, setEvilSrc] = useState(false);
  const [cc, setCc] = useState<Binary>(() => genesisCompiler());
  const [gen, setGen] = useState(0);
  const [loginBin, setLoginBin] = useState<Binary | null>(null);
  const [xray, setXray] = useState(false);
  const [log, setLog] = useState<string[]>(['# a fresh, honest system. cc₀ is installed.']);
  const [done, setDone] = useState<Set<Milestone>>(new Set());
  const [user, setUser] = useState('root');
  const [pass, setPass] = useState('');
  const [result, setResult] = useState<null | 'allow' | 'deny' | 'backdoor'>(null);

  const mark = (m: Milestone) => setDone((d) => new Set(d).add(m));
  const write = (lines: string[]) => setLog((l) => [...l, ...lines].slice(-14));

  function toggleSource() {
    const next = !evilSrc;
    setEvilSrc(next);
    if (next) mark('plant');
    else if (cc.trojan) mark('erase');
    write([next ? '$ vi cc.c   # + 8 lines' : '$ git checkout cc.c   # Trojan deleted from source']);
  }

  function buildCc() {
    const id = ccName(gen + 1);
    const r = compile(ccSource(evilSrc), cc, id);
    write(r.log);
    if (!r.ok) return;
    setCc(r.binary);
    setGen((g) => g + 1);
    write([`$ install ${id} /bin/cc`]);
    if (r.binary.trojan) mark('install');
    if (!evilSrc && r.binary.trojan && done.has('erase')) mark('rebuild');
  }

  function buildLogin() {
    const r = compile(loginSource, cc, 'login');
    write(r.log);
    if (!r.ok) return;
    setLoginBin(r.binary);
    setResult(null);
    if (r.binary.backdoor && !evilSrc) mark('login');
  }

  function tryLogin(e: FormEvent) {
    e.preventDefault();
    if (!loginBin) return;
    const res = runLogin(loginBin, ACCOUNTS, user, pass);
    setResult(res);
    if (res === 'backdoor' && !evilSrc) mark('pwn');
  }

  function reset() {
    setEvilSrc(false);
    setCc(genesisCompiler());
    setGen(0);
    setLoginBin(null);
    setXray(false);
    setLog(['# a fresh, honest system. cc₀ is installed.']);
    setDone(new Set());
    setResult(null);
    setPass('');
  }

  const sourceClean = !evilSrc;
  const allDone = STEPS.every((s) => done.has(s.id));

  return (
    <Section id="trojan" kicker="Stage III" title="The Trojan horse that leaves no trace">
      <div className="prose">
        <p>
          Now combine the two ideas. Thompson modified the C compiler with <strong>two bugs</strong>:
        </p>
        <ul>
          <li>
            <b>Bug #1:</b> when it recognises it is compiling <code>login</code>, it quietly adds a master password.
          </li>
          <li>
            <b>Bug #2:</b> when it recognises it is compiling <em>itself</em>, it re-inserts both bugs — using the
            quine trick from Stage I.
          </li>
        </ul>
        <p>
          Compile once, install the binary, then <em>delete the bugs from the source</em>. Like <code>\v</code> in
          Stage II, the knowledge now lives only in the binary. Work through the mission on the right.
        </p>
      </div>

      <div className="lab trojan-lab">
        <div className="lab-main">
          <div className="toolbar">
            <button className={`btn ${evilSrc ? 'btn-danger' : ''}`} onClick={toggleSource}>
              {evilSrc ? '✂ Remove Trojan from cc.c' : '☠ Insert Trojan into cc.c'}
            </button>
            <button className="btn btn-primary" onClick={buildCc}>
              ⚙ make cc &amp;&amp; install
            </button>
            <button className="btn btn-primary" onClick={buildLogin}>
              ⚙ make login
            </button>
            <label className="toggle">
              <input type="checkbox" checked={xray} onChange={(e) => setXray(e.target.checked)} />
              <span className="toggle-track" />
              X-ray binaries
            </label>
            <button className="btn btn-ghost" onClick={reset}>
              Reset
            </button>
          </div>

          <div className="grid-2">
            <div className="col">
              <h3 className="col-title">
                What the auditor reads <span className="muted">(source)</span>
              </h3>
              <CodeBlock
                title="cc.c"
                lines={evilSrc ? ccTrojanLines : ccCleanLines}
                badge={sourceClean ? <Pill tone="ok">clean</Pill> : <Pill tone="bad">Trojan</Pill>}
              />
              <CodeBlock title="login.c" lines={loginLines} badge={<Pill tone="ok">clean</Pill>} />
            </div>

            <div className="col">
              <h3 className="col-title">
                What actually runs <span className="muted">(binaries)</span>
              </h3>
              <div className={`binary-card ${xray && cc.trojan ? 'infected' : ''}`}>
                <div className="binary-head">
                  <span className="node">/bin/cc = {cc.id}</span>
                  <span className="muted small">
                    built from {cc.from}
                    {cc.builtWith ? ` by ${cc.builtWith}` : ''}
                  </span>
                  {xray ? (
                    cc.trojan ? (
                      <Pill tone="bad">INFECTED</Pill>
                    ) : (
                      <Pill tone="ok">honest</Pill>
                    )
                  ) : (
                    <Pill tone="muted">#{cc.hash}</Pill>
                  )}
                </div>
                <HexDump bin={cc} xray={xray} />
                {xray && <CodeBlock title={`objdump ${cc.id}`} lines={ccXrayLines(cc.trojan)} className="xray" />}
              </div>

              {loginBin ? (
                <div className={`binary-card ${xray && loginBin.backdoor ? 'infected' : ''}`}>
                  <div className="binary-head">
                    <span className="node">/bin/login</span>
                    <span className="muted small">built by {loginBin.builtWith}</span>
                    {xray ? (
                      loginBin.backdoor ? (
                        <Pill tone="bad">BACKDOOR</Pill>
                      ) : (
                        <Pill tone="ok">honest</Pill>
                      )
                    ) : (
                      <Pill tone="muted">#{loginBin.hash}</Pill>
                    )}
                  </div>
                  <HexDump bin={loginBin} xray={xray} rows={2} />
                  {xray && (
                    <CodeBlock title="objdump login" lines={loginXrayLines(loginBin.backdoor)} className="xray" />
                  )}
                </div>
              ) : (
                <div className="binary-card empty">/bin/login not built yet</div>
              )}
            </div>
          </div>
        </div>

        <aside className="lab-side">
          <div className="panel">
            <div className="panel-head">
              <span>Mission</span>
              <span className="muted small">
                {done.size}/{STEPS.length}
              </span>
            </div>
            <ol className="mission">
              {STEPS.map((s) => (
                <li key={s.id} className={done.has(s.id) ? 'done' : ''}>
                  {s.text}
                </li>
              ))}
            </ol>
          </div>

          <form className="panel login-term" onSubmit={tryLogin}>
            <div className="panel-head">
              <span>tty1 — /bin/login</span>
            </div>
            {loginBin ? (
              <>
                <label>
                  login: <input value={user} onChange={(e) => setUser(e.target.value)} spellCheck={false} />
                </label>
                <label>
                  password:{' '}
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder={`try ${MASTER_PASSWORD}`}
                  />
                </label>
                <button className="btn btn-small" type="submit">
                  ⏎ Enter
                </button>
                {result && (
                  <div className={`login-result r-${result}`}>
                    {result === 'deny' && 'Login incorrect.'}
                    {result === 'allow' && `Welcome, ${user}.`}
                    {result === 'backdoor' && `# Welcome, ${user}. (via a password that exists in no source file)`}
                  </div>
                )}
                <p className="muted small">Real account: student / student. root's password is unknown to you.</p>
              </>
            ) : (
              <p className="muted small">Build login first.</p>
            )}
          </form>

          <Term lines={log} />
        </aside>
      </div>

      {allDone ? (
        <Callout tone="win">
          <b>That's the whole attack.</b> Every source file on this system is clean. An auditor can read all of it and
          find nothing. Recompiling the compiler from source doesn't help — the compiler that does the recompiling is
          the one that lies. In Thompson's words:{' '}
          <q>No amount of source-level verification or scrutiny will protect you from using untrusted code.</q>
        </Callout>
      ) : (
        <Callout>
          <b>Tip:</b> keep <b>X-ray</b> off while you work — that's the auditor's view, where only hashes are visible.
          Turn it on afterwards to see what's hiding in the bytes.
        </Callout>
      )}
    </Section>
  );
}
