import { useMemo, useState, type ReactNode } from 'react';
import { compile, diverseDoubleCompile, genesisCompiler, type Binary } from '../sim/model';
import { ccSource } from '../sim/sources';
import { Callout, Pill, Section } from './ui';

function must(r: ReturnType<typeof compile>): Binary {
  if (!r.ok) throw new Error(r.error);
  return r.binary;
}

/** Build the suspect compiler "A" the way a vendor would ship it. */
function buildSuspect(infected: boolean): Binary {
  const parent = must(compile(ccSource(infected), genesisCompiler(), 'a0'));
  return must(compile(ccSource(false), parent, 'A'));
}

const TRUSTED = genesisCompiler('T', { codegen: 'tcc', from: '(different vendor)' });

export function DDC() {
  const [infected, setInfected] = useState(true);
  const [step, setStep] = useState(0);

  const { A, selfCheck, ddc } = useMemo(() => {
    const A = buildSuspect(infected);
    return {
      A,
      selfCheck: must(compile(ccSource(false), A, 'A′')),
      ddc: diverseDoubleCompile(ccSource(false), A, TRUSTED),
    };
  }, [infected]);

  const flip = (v: boolean) => {
    setInfected(v);
    setStep(0);
  };

  return (
    <Section id="ddc" kicker="Stage IV · beyond the paper" title="Can you ever catch it?">
      <div className="prose">
        <p>
          Thompson's paper ends on a bleak note. Twenty-one years later, David A. Wheeler proposed a practical
          countermeasure: <strong>Diverse Double-Compiling (DDC)</strong>. The idea: get a <em>second, independent</em>{' '}
          compiler <code>T</code>. A Trojan in <code>A</code> is unlikely to also know how to infect a totally
          different compiler. Use <code>T</code> to rebuild <code>A</code>'s source — twice — and compare bytes.
        </p>
      </div>

      <div className="lab">
        <div className="row">
          <span className="muted">Secretly, the vendor's compiler A is…</span>
          <div className="seg">
            <button className={!infected ? 'on' : ''} onClick={() => flip(false)}>
              honest
            </button>
            <button className={infected ? 'on bad' : ''} onClick={() => flip(true)}>
              infected
            </button>
          </div>
        </div>

        <div className="ddc-grid">
          <Card title="Naive check" sub="rebuild A's source with A itself">
            <Hash label="A" bin={A} />
            <Arrow text="A compiles cc.c" />
            <Hash label="A′" bin={selfCheck} />
            <Verdict ok={selfCheck.hash === A.hash} okText="identical" badText="differs" />
            <p className="muted small">
              Always identical — even when infected! The Trojan rebuilds itself, so self-compilation proves nothing.
            </p>
          </Card>

          <Card title="Diverse Double-Compiling" sub="rebuild with an independent compiler T">
            <Hash label="T (trusted)" bin={TRUSTED} />
            <Arrow text="T compiles cc.c" show={step >= 1} />
            {step >= 1 && <Hash label="stage1" bin={ddc.stage1} note="different bytes than A — different code generator. Expected!" />}
            <Arrow text="stage1 compiles cc.c" show={step >= 2} />
            {step >= 2 && <Hash label="stage2" bin={ddc.stage2} />}
            {step >= 3 && (
              <>
                <div className="cmp">
                  compare <code>stage2</code> with <code>A</code>: {ddc.stage2.hash} vs {A.hash}
                </div>
                <Verdict ok={ddc.match} okText="bit-for-bit match → A faithfully represents its source" badText="MISMATCH → A contains something not in its source" />
              </>
            )}
            <div className="row">
              <button className="btn btn-primary" onClick={() => setStep((s) => Math.min(3, s + 1))} disabled={step >= 3}>
                {['▶ Compile with T', '▶ Compile again with stage1', '▶ Compare with A', 'done'][step]}
              </button>
              <button className="btn btn-ghost" onClick={() => setStep(0)}>
                Reset
              </button>
            </div>
          </Card>
        </div>

        <Callout>
          <b>Why it works:</b> stage1 is built from A's <em>source</em>, so it behaves like an honest A, just with
          different bytes. When stage1 then compiles the same source, it emits exactly what an honest A would. If the
          shipped A differs, something in A came from somewhere other than its source. Related real-world defenses
          include <b>reproducible builds</b> (anyone can rebuild and get identical bytes) and <b>bootstrappable builds</b>{' '}
          (grow a full toolchain from a tiny, human-auditable seed).
        </Callout>
      </div>
    </Section>
  );
}

function Card({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="panel ddc-card">
      <div className="panel-head">
        <span>{title}</span>
        <span className="muted small">{sub}</span>
      </div>
      <div className="ddc-body">{children}</div>
    </div>
  );
}

function Hash({ label, bin, note }: { label: string; bin: Binary; note?: string }) {
  return (
    <div className="hash-row appear">
      <span className="node">{label}</span>
      <code className="hash">{bin.hash}</code>
      {note && <span className="muted small">{note}</span>}
    </div>
  );
}

function Arrow({ text, show = true }: { text: string; show?: boolean }) {
  return <div className={`arrow ${show ? 'appear' : 'ghosted'}`}>↓ {text}</div>;
}

function Verdict({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return <div className="verdict appear">{ok ? <Pill tone="ok">✓ {okText}</Pill> : <Pill tone="bad">✗ {badText}</Pill>}</div>;
}
