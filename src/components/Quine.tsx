import { useMemo, useState } from 'react';
import { buildQuine, runProgram, sanitize } from '../sim/quine';
import { Callout, Section } from './ui';

export function Quine() {
  const [msg, setMsg] = useState('Hello from inside the DNA');
  const program = useMemo(() => buildQuine(sanitize(msg)), [msg]);
  const [current, setCurrent] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [gen, setGen] = useState(0);

  const source = current ?? program;
  const same = output !== null && output === source;

  function exec() {
    setOutput(runProgram(source));
  }
  function feedBack() {
    if (output === null) return;
    setCurrent(output);
    setOutput(null);
    setGen((g) => g + 1);
  }
  function edit(v: string) {
    setMsg(v);
    setCurrent(null);
    setOutput(null);
    setGen(0);
  }

  return (
    <Section id="quine" kicker="Stage I" title="A program that prints its own source">
      <div className="prose">
        <p>
          Thompson begins with a puzzle from his college days: write the shortest program that, when run, outputs an
          exact copy of its own source code. These are called <strong>quines</strong>. The trick is that the program
          holds a description of itself as <em>data</em> (a string), and then prints that data twice — once as code,
          once as a quoted string.
        </p>
        <p>
          The lesson he wanted: <strong>a program can carry an arbitrary payload and still reproduce itself
          exactly</strong>. Type a payload below — it rides along in every generation.
        </p>
      </div>

      <div className="lab">
        <label className="field">
          <span>Payload (rides along in every copy)</span>
          <input value={msg} onChange={(e) => edit(e.target.value)} maxLength={60} spellCheck={false} />
        </label>

        <div className="grid-2">
          <div className="panel">
            <div className="panel-head">
              <span>quine.js · generation {gen}</span>
              <span className="legend">
                <i className="sw sw-code" /> code <i className="sw sw-data" /> same text, as data
              </span>
            </div>
            <pre className="quine-src">
              <QuineHighlight src={source} />
            </pre>
          </div>
          <div className="panel">
            <div className="panel-head">
              <span>stdout</span>
              {output !== null && (
                <span className={same ? 'pill pill-ok' : 'pill pill-bad'}>
                  {same ? 'output === source ✓' : 'output differs ✗'}
                </span>
              )}
            </div>
            <pre className={`quine-out ${output !== null ? 'flash' : ''}`} key={`${gen}-${output !== null}`}>
              {output ?? <span className="muted">press ▶ Run to execute the program in your browser</span>}
            </pre>
          </div>
        </div>

        <div className="row">
          <button className="btn btn-primary" onClick={exec}>
            ▶ Run
          </button>
          <button className="btn" onClick={feedBack} disabled={output === null}>
            ⟳ Feed output back in as the new program
          </button>
        </div>
      </div>

      <Callout>
        <b>Why this matters:</b> if a program can reproduce itself plus a payload, then a <em>compiler</em> — which
        writes programs for a living — can be made to reproduce a payload into the next version of itself. Hold that
        thought.
      </Callout>
    </Section>
  );
}

/** Colour the self-describing string differently from the code that uses it. */
function QuineHighlight({ src }: { src: string }) {
  const start = src.indexOf('s="');
  const end = src.indexOf('";console');
  if (start < 0 || end < 0) return <>{src}</>;
  return (
    <>
      <span className="q-code">{src.slice(0, start + 2)}</span>
      <span className="q-data">{src.slice(start + 2, end + 1)}</span>
      <span className="q-code">{src.slice(end + 1)}</span>
    </>
  );
}
