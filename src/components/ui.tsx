import { useEffect, useRef, type ReactNode } from 'react';
import { bytesOf, type Binary } from '../sim/model';

export function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section">
      <header className="section-head">
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

export function Callout({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' | 'win' }) {
  return <div className={`callout callout-${tone}`}>{children}</div>;
}

export function Pill({ tone, children }: { tone: 'ok' | 'bad' | 'muted' | 'warn'; children: ReactNode }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

/** A stylised hex dump of a binary. Injected bytes glow red in X-ray mode. */
export function HexDump({ bin, xray, rows = 3 }: { bin: Binary; xray: boolean; rows?: number }) {
  const bytes = bytesOf(bin.hash, rows * 12);
  const evil = bin.trojan || bin.backdoor;
  return (
    <div className="hexdump" aria-label={`Bytes of ${bin.id}`}>
      {bytes.map((b, i) => {
        const hot = xray && evil && i % 12 >= 4 && i % 12 < 8 && Math.floor(i / 12) === 1;
        return (
          <span key={i} className={hot ? 'hot' : ''}>
            {b.toString(16).padStart(2, '0')}
          </span>
        );
      })}
    </div>
  );
}

/** Scrolling terminal log that keeps the newest line in view. */
export function Term({ lines, className = '' }: { lines: string[]; className?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  return (
    <pre ref={ref} className={`term ${className}`}>
      {lines.map((l, i) => (
        <div key={i} className={/error|silently/.test(l) ? 'err' : l.startsWith('#') ? 'muted' : ''}>
          {l}
        </div>
      ))}
    </pre>
  );
}
