import { Bootstrap } from './components/Bootstrap';
import { DDC } from './components/DDC';
import { Hero } from './components/Hero';
import { Quine } from './components/Quine';
import { Quiz } from './components/Quiz';
import { Timeline } from './components/Timeline';
import { TrojanLab } from './components/TrojanLab';

export default function App() {
  return (
    <>
      <div className="scanlines" aria-hidden />
      <main className="wrap">
        <Hero />
        <Quine />
        <Bootstrap />
        <TrojanLab />
        <DDC />
        <Timeline />
        <section className="section moral">
          <blockquote>
            “You can't trust code that you did not totally create yourself. (Especially code from companies that
            employ people like me.)”
            <cite>— Ken Thompson, 1984</cite>
          </blockquote>
        </section>
        <Quiz />
        <footer className="footer">
          <p>
            A teaching visualization of Ken Thompson, “Reflections on Trusting Trust,” <i>Communications of the ACM</i>{' '}
            27(8), 1984. Everything here is a simulation: no real code is compiled and nothing here is an attack tool.
          </p>
          <p>
            Further reading: <a href="https://dl.acm.org/doi/10.1145/358198.358210">the original paper (ACM)</a> ·{' '}
            <a href="https://dwheeler.com/trusting-trust/">David A. Wheeler on Diverse Double-Compiling</a> ·{' '}
            <a href="https://reproducible-builds.org/">Reproducible Builds</a>
          </p>
        </footer>
      </main>
    </>
  );
}
