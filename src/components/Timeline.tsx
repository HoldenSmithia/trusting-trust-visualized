import { useState } from 'react';
import { Section } from './ui';

const EVENTS = [
  {
    year: '1974',
    title: 'Multics security evaluation',
    body: 'Karger & Schell\'s U.S. Air Force review of Multics described a compiler trap door. Thompson credits this report as the source of the idea.',
  },
  {
    year: '1984',
    title: '"Reflections on Trusting Trust"',
    body: "Thompson's lecture for the 1983 Turing Award, which he shared with Dennis Ritchie for UNIX, is published in Communications of the ACM in August 1984.",
  },
  {
    year: '2005',
    title: 'Diverse Double-Compiling',
    body: 'David A. Wheeler publishes DDC, later expanded into his 2009 PhD dissertation, giving a practical way to detect a Thompson-style compiler Trojan.',
  },
  {
    year: '2009',
    title: 'W32/Induc-A',
    body: 'A real virus that infected Delphi compiler installations, so every program built with them came out infected — the attack, in the wild.',
  },
  {
    year: '2015',
    title: 'XcodeGhost',
    body: 'A tampered copy of Apple\'s Xcode, shared through unofficial download sites, injected malicious code into iOS apps built with it, some of which reached the App Store.',
  },
  {
    year: '2020',
    title: 'SolarWinds SUNBURST',
    body: 'Attackers compromised the build system for Orion software. The backdoor was inserted at build time, then signed and shipped to thousands of customers as a normal update.',
  },
  {
    year: '2024',
    title: 'xz-utils backdoor',
    body: 'A malicious maintainer hid a backdoor (CVE-2024-3094) in release tarballs and binary test files rather than in the readable source, aimed at SSH servers. It was caught by chance.',
  },
];

export function Timeline() {
  const [open, setOpen] = useState(1);
  return (
    <Section id="history" kicker="Then & now" title="This is not just a thought experiment">
      <div className="timeline" role="tablist" aria-label="Timeline of trusting-trust attacks and defenses">
        {EVENTS.map((e, i) => (
          <button
            key={e.year}
            role="tab"
            aria-selected={open === i}
            className={`tl-dot ${open === i ? 'on' : ''}`}
            onClick={() => setOpen(i)}
          >
            <span className="tl-year">{e.year}</span>
            <span className="tl-name">{e.title}</span>
          </button>
        ))}
      </div>
      <div className="tl-body panel appear" key={open}>
        <h3>
          {EVENTS[open].year} — {EVENTS[open].title}
        </h3>
        <p>{EVENTS[open].body}</p>
      </div>
    </Section>
  );
}
