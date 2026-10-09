import type { ReactNode } from 'react';
import type { CodeLine } from '../sim/sources';

const TOKEN =
  /(\/\*.*?\*\/|\/\/.*$|;.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(int|char|if|else|return|while|for|void|struct|call|jnz|ret)\b|\b(\d+|NULL|ALLOW|DENY)\b/g;

/** Tiny C-ish syntax highlighter — good enough for teaching snippets. */
function highlight(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    const cls = m[1] ? 'tk-com' : m[2] ? 'tk-str' : m[3] ? 'tk-kw' : 'tk-num';
    out.push(
      <span key={i} className={cls}>
        {m[0]}
      </span>,
    );
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

interface Props {
  title: string;
  lines: readonly CodeLine[];
  badge?: ReactNode;
  className?: string;
}

export function CodeBlock({ title, lines, badge, className = '' }: Props) {
  return (
    <figure className={`code ${className}`}>
      <figcaption className="code-head">
        <span className="dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="code-title">{title}</span>
        {badge}
      </figcaption>
      <pre>
        {lines.map((l, i) => (
          <div key={`${i}-${l.text}`} className={`ln ${l.tone ? `ln-${l.tone}` : ''}`}>
            <span className="ln-no">{i + 1}</span>
            <code>{highlight(l.text)}</code>
          </div>
        ))}
      </pre>
    </figure>
  );
}
