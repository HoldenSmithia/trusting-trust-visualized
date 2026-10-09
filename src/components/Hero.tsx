import { useEffect, useState } from 'react';

const LINES = [
  '$ cat login.c | grep -i backdoor',
  '$ # nothing. the source is clean.',
  '$ cat cc.c | grep -i backdoor',
  '$ # nothing. the compiler source is clean too.',
  '$ ./login',
  'login: root',
  'password: ●●●●●●●',
  '# whoami',
  'root',
];

export function Hero() {
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (shown >= LINES.length) return;
    const line = LINES[shown];
    const t = setTimeout(
      () => {
        if (chars < line.length) setChars((c) => c + 1);
        else {
          setShown((s) => s + 1);
          setChars(0);
        }
      },
      chars < line.length ? 28 : 420,
    );
    return () => clearTimeout(t);
  }, [shown, chars]);

  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Ken Thompson · ACM Turing Award Lecture · 1984</p>
        <h1>
          Reflections on <span className="glitch" data-text="Trusting Trust">Trusting Trust</span>
        </h1>
        <p className="lede">
          How can a program contain a backdoor that appears in <em>no source code anywhere</em>? Thompson showed it
          takes just three ideas. Play with each one below — by the end you'll plant an invisible Trojan horse in a
          compiler, and then learn how to catch it.
        </p>
        <nav className="stage-nav">
          <a href="#quine">
            <b>I</b> Programs that print themselves
          </a>
          <a href="#bootstrap">
            <b>II</b> Compilers that learn
          </a>
          <a href="#trojan">
            <b>III</b> The Trojan horse
          </a>
          <a href="#ddc">
            <b>IV</b> Fighting back
          </a>
        </nav>
      </div>
      <div className="crt" aria-label="Animated terminal showing a root login with no backdoor in the source">
        <div className="crt-inner">
          {LINES.slice(0, shown).map((l, i) => (
            <div key={i} className={l.startsWith('#') && i > 6 ? 'crt-root' : ''}>
              {l}
            </div>
          ))}
          {shown < LINES.length && (
            <div>
              {LINES[shown].slice(0, chars)}
              <span className="caret" />
            </div>
          )}
          {shown >= LINES.length && <div className="crt-punch">…how?</div>}
        </div>
      </div>
    </header>
  );
}
