import { useState } from 'react';
import { ccName, compile, genesisCompiler, type Binary } from '../sim/model';
import { vtSource, vtVariants, type VtVariant } from '../sim/sources';
import { CodeBlock } from './CodeBlock';
import { Callout, Pill, Section, Term } from './ui';

export function Bootstrap() {
  const [variant, setVariant] = useState<VtVariant>('none');
  const [chain, setChain] = useState<{ bin: Binary; variant: VtVariant | null }[]>([
    { bin: genesisCompiler(), variant: null },
  ]);
  const [log, setLog] = useState<string[]>(['# installed: cc₀ (does not know \\v)']);
  const [error, setError] = useState(false);

  const installed = chain[chain.length - 1];
  const solved = installed.variant === 'escape' && installed.bin.knowsVt;

  function build() {
    const r = compile(vtSource(variant), installed.bin, ccName(chain.length));
    setLog((l) => [...l, ...r.log, ...(r.ok ? [`# installed ${r.binary.id}`] : [])].slice(-12));
    setError(!r.ok);
    if (r.ok) setChain((c) => [...c, { bin: r.binary, variant }]);
  }

  function reset() {
    setChain([{ bin: genesisCompiler(), variant: null }]);
    setLog(['# installed: cc₀ (does not know \\v)']);
    setVariant('none');
    setError(false);
  }

  return (
    <Section id="bootstrap" kicker="Stage II" title="A compiler that learns — and remembers">
      <div className="prose">
        <p>
          The C compiler is written in C. When it reads a string like <code>"\n"</code>, its source literally says{' '}
          <code>if (c == 'n') return '\n';</code> — it defines newline <em>in terms of itself</em>. So where does the
          actual number 10 live? Only in the <strong>binary</strong> of the previous compiler.
        </p>
        <p>
          Thompson's example: teach the compiler a new escape, <code>\v</code> (vertical tab, ASCII 11).
        </p>
        <ol className="goals">
          <li>
            <b>Goal:</b> end up with an installed compiler whose source says <code>return '\v';</code> — no{' '}
            <code>11</code> anywhere.
          </li>
        </ol>
      </div>

      <div className="lab">
        <div className="grid-2">
          <div>
            <label className="field">
              <span>Edit cc.c — choose how to handle '\v'</span>
              <div className="seg">
                {(Object.keys(vtVariants) as VtVariant[]).map((k) => (
                  <button key={k} className={variant === k ? 'on' : ''} onClick={() => setVariant(k)}>
                    {vtVariants[k].label}
                  </button>
                ))}
              </div>
            </label>
            <CodeBlock title="cc.c (lexer excerpt)" lines={vtVariants[variant].lines} />
            <div className="row">
              <button className="btn btn-primary" onClick={build}>
                ⚙ Compile with {installed.bin.id} &amp; install
              </button>
              <button className="btn btn-ghost" onClick={reset}>
                Reset
              </button>
            </div>
          </div>

          <div>
            <div className="panel">
              <div className="panel-head">
                <span>Compiler lineage</span>
              </div>
              <ol className="lineage">
                {chain.map(({ bin, variant: v }, i) => (
                  <li key={bin.id} className={i === chain.length - 1 ? 'current' : ''}>
                    <span className="node">{bin.id}</span>
                    <span className="muted small">{v ? `from cc.c [${vtVariants[v].label}]` : 'hand-assembled'}</span>
                    {bin.knowsVt ? <Pill tone="ok">knows \v = 11</Pill> : <Pill tone="muted">no \v</Pill>}
                  </li>
                ))}
              </ol>
            </div>
            <Term lines={log} className={error ? 'shake' : ''} key={log.length} />
          </div>
        </div>
        {solved && (
          <Callout tone="win">
            <b>Solved.</b> Look at {installed.bin.id}'s source: it says <code>return '\v';</code>. The fact that{' '}
            <code>\v</code> means 11 is now stored <em>only in the binary</em>, passed from compiler to compiler like a
            gene. Nothing in the source records it. This is a benign "learned" trait — Stage III makes it malicious.
          </Callout>
        )}
        {!solved && error && (
          <Callout tone="warn">
            The installed compiler can't understand <code>'\v'</code> yet — you can't use a word to define itself until
            someone has taught it. Try teaching it with the literal value first.
          </Callout>
        )}
      </div>
    </Section>
  );
}
