import { useState } from 'react';
import { Section } from './ui';

const QUESTIONS = [
  {
    q: 'In Stage I, what lets a quine print its own source?',
    options: [
      'It reads its own file from disk',
      'It stores a description of itself as data and prints that data twice: once as code, once quoted',
      'The interpreter has a special "print source" instruction',
    ],
    answer: 1,
    why: 'A quine is self-contained: the program carries its own text as a string. No file access, no cheating.',
  },
  {
    q: "After Stage II, where is the fact that '\\v' = 11 recorded?",
    options: ['In the compiler source', 'In the C standard header files', 'Only in the compiler binary'],
    answer: 2,
    why: "Once the compiler is rebuilt with return '\\v'; the number 11 appears in no source file. It survives because each compiler binary passes it to the next.",
  },
  {
    q: 'You audit every line of login.c and cc.c and find nothing. Is the system safe?',
    options: [
      'Yes — the source is clean',
      'Not necessarily — the installed compiler binary may inject code no source contains',
      'Yes, as long as you also recompile everything from source',
    ],
    answer: 1,
    why: 'Recompiling uses the same compromised compiler, which re-inserts the Trojan. Source review cannot detect it.',
  },
  {
    q: "Why does bug #2 (the compiler recognising itself) matter?",
    options: [
      'It makes the compiler faster',
      'It lets the Trojan survive after it is deleted from the compiler source',
      'It hides the backdoor password from strings(1)',
    ],
    answer: 1,
    why: 'Without bug #2 the next recompile from clean source would produce an honest compiler. Bug #2 is the quine: it reproduces itself.',
  },
  {
    q: 'In Diverse Double-Compiling, what does a bit-for-bit match between stage2 and A show?',
    options: [
      'That A and T are the same compiler',
      'That A faithfully corresponds to its source code (assuming T is not colluding)',
      "That A's source code has no bugs",
    ],
    answer: 1,
    why: "DDC shows the binary matches its source. It says nothing about whether the source itself is correct or benign — you still need to review that.",
  },
];

export function Quiz() {
  const [picks, setPicks] = useState<(number | null)[]>(QUESTIONS.map(() => null));
  const score = picks.filter((p, i) => p === QUESTIONS[i].answer).length;
  const answered = picks.filter((p) => p !== null).length;

  return (
    <Section id="quiz" kicker="Check yourself" title="Quiz">
      <div className="quiz">
        {QUESTIONS.map((item, qi) => {
          const pick = picks[qi];
          return (
            <div key={qi} className="panel quiz-q">
              <p className="quiz-prompt">
                <span className="muted">{qi + 1}.</span> {item.q}
              </p>
              <div className="quiz-opts">
                {item.options.map((o, oi) => {
                  const state = pick === null ? '' : oi === item.answer ? 'right' : oi === pick ? 'wrong' : 'faded';
                  return (
                    <button
                      key={oi}
                      className={`quiz-opt ${state}`}
                      disabled={pick !== null}
                      onClick={() => setPicks((p) => p.map((v, i) => (i === qi ? oi : v)))}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {pick !== null && <p className="quiz-why appear">{item.why}</p>}
            </div>
          );
        })}
        <div className="quiz-score">
          {answered === QUESTIONS.length ? (
            <>
              Score: <b>{score}</b> / {QUESTIONS.length}{' '}
              <button className="btn btn-ghost btn-small" onClick={() => setPicks(QUESTIONS.map(() => null))}>
                Retry
              </button>
            </>
          ) : (
            <span className="muted">
              {answered} / {QUESTIONS.length} answered
            </span>
          )}
        </div>
      </div>
    </Section>
  );
}
