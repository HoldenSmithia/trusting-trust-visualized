# Trusting Trust, Visualized

An interactive teaching module for Ken Thompson's 1984 Turing Award lecture, **"Reflections on Trusting Trust."** It's a static React + TypeScript web app. You work through the paper's three stages hands-on, plant a self-reproducing Trojan horse in a simulated compiler, and then catch it with Diverse Double-Compiling.

> "You can't trust code that you did not totally create yourself."
> — Ken Thompson

**This is a safe simulation.** No real code gets compiled. The "compiler" is a small TypeScript model of the paper's logic, and nothing here is an exploit or attack tool.

## What's inside

| Section | Concept from the paper | What you can do |
|---|---|---|
| **Stage I: Quines** | A program can print its own source, and can carry an arbitrary payload while doing so. | Type a payload and **run** a real JavaScript quine in your browser. Check that the output equals the source, then feed the output back in to see that it's a fixed point. |
| **Stage II: The compiler learns** | A self-hosting compiler can "learn" a fact (`'\v'` = 11). After that, the fact lives only in the binary. | Choose which version of the lexer source to compile. If you try `return '\v';` first, the build fails. Teach the compiler with `return 11;`, then rebuild, and watch the lineage of compiler binaries. |
| **Stage III: The Trojan horse** | Two bugs: backdoor `login`, and re-insert yourself when compiling the compiler. Then delete the bugs from the source. | A six-step mission: insert the Trojan, install it, erase it from source, rebuild, compile a clean `login.c`, then log in as root with a password that exists in no source file. The **X-ray** toggle shows what's hiding in the binaries. |
| **Stage IV: Fighting back** | (Beyond the paper) David A. Wheeler's Diverse Double-Compiling. | Toggle whether the vendor's compiler is secretly infected. Run DDC step by step and compare hashes. You'll also see why "recompile with itself" proves nothing. |
| **Then & now** | Real-world cases of the same idea. | A clickable timeline: Multics (1974), the paper (1984), DDC (2005), Induc (2009), XcodeGhost (2015), SolarWinds (2020), xz-utils (2024). |
| **Quiz** | Review | Five questions with explanations. |

## Run it locally

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for the compiler model and quine
npm run build      # static site in dist/
```

## Deploying

The `dist/` folder is a fully static site, and `vite.config.ts` uses a relative `base` so it can be served from any path. A GitHub Actions workflow (`.github/workflows/deploy.yml`) tests, builds and publishes to **GitHub Pages** on every push to `main`. To turn it on, go to *Settings → Pages → Source: GitHub Actions*.

## How the simulation works

All of the paper's logic lives in [`src/sim/model.ts`](src/sim/model.ts). `compile(source, compilerBinary)` is the paper's Figure 3.3 written as a function:

```ts
const injectLogin = cc.trojan && src.kind === 'login';     // bug #1
const injectSelf  = cc.trojan && src.kind === 'compiler';  // bug #2
```

A binary's "bytes" (a hash) depend on three things: the source text, the code generator that emitted it, and anything the compiler secretly injected. That's enough to reproduce each result in the paper, and the DDC result too. The unit tests in `src/sim/*.test.ts` check each of them:

- `'\v'` can't be compiled until a compiler has been taught it
- the Trojan survives being deleted from source
- `login` gets a backdoor only when an infected compiler builds it
- self-recompilation can't detect the Trojan, but DDC can

## Project structure

```
src/
  sim/          model.ts (compiler model), sources.ts (code shown on screen), quine.ts, tests
  components/   Hero, Quine, Bootstrap, TrojanLab, DDC, Timeline, Quiz, CodeBlock, ui
  App.tsx       page layout
  styles.css    CRT / terminal theme
```

## Tech

React 18, TypeScript (strict), Vite 5, Vitest. No UI or animation libraries: the styling and animation are plain CSS. The layout is responsive, and the page respects `prefers-reduced-motion`.

## References

- Ken Thompson, "Reflections on Trusting Trust," *Communications of the ACM* 27(8), Aug. 1984. [doi:10.1145/358198.358210](https://dl.acm.org/doi/10.1145/358198.358210)
- David A. Wheeler, "Countering Trusting Trust through Diverse Double-Compiling," ACSAC 2005. [dwheeler.com/trusting-trust](https://dwheeler.com/trusting-trust/)
- Paul A. Karger and Roger R. Schell, *Multics Security Evaluation: Vulnerability Analysis*, 1974.
- [Reproducible Builds](https://reproducible-builds.org/) · [Bootstrappable Builds](https://bootstrappable.org/)

## Use of AI

This app was built with help from an AI coding assistant (Claude Code). See [`reflection.md`](reflection.md) for the workflow.
