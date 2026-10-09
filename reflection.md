<!-- DRAFT: written by the AI assistant from the build session. Rewrite it in your own words and fill in the [bracketed] parts before submitting. -->

# Reflection

## What I built

For this module I chose Ken Thompson's "Reflections on Trusting Trust" instead of a buffer overflow or integer overflow. It's about the same underlying problem: the code we read is not always the code that actually runs. I built an interactive React + TypeScript site that follows the paper's three stages (quines, a compiler that learns, and the self-reproducing Trojan horse) and adds a fourth stage on how to detect it with Diverse Double-Compiling.

## How it deepened my understanding

When I first read the paper, Stage II seemed like a strange detour. Why does Thompson care so much about the `'\v'` escape character? Building it as a lab is what made it click. To get a compiler whose source says `return '\v';`, you first have to compile a version that says `return 11;`. After that, the number 11 doesn't appear anywhere in the source. It only lives in the binary and gets passed from one compiler to the next. Stage III is the same mechanism used for something harmful, and Stage I (the quine) is what makes the "re-insert yourself" bug possible. I had read those as three separate tricks, but they're really one idea.

Writing the "naive check" in the DDC section also cleared something up for me. Recompiling a compiler with itself gives the same bytes even when it's infected, because the Trojan rebuilds itself. That's why "just recompile from source" doesn't help, and why DDC needs a *second, independent* compiler. I also learned that DDC only proves the binary matches its source. It says nothing about whether the source itself is safe.

The timeline showed me this isn't only theory: Induc, XcodeGhost, SolarWinds and xz-utils all attacked the build process instead of the visible source code. [Add a sentence about which case surprised you most and why.]

## Workflow

1. **Reading and planning.** I re-read the paper and wrote down the core claim of each stage, plus the interaction that would let someone *discover* that claim instead of just reading it.
2. **AI-assisted development.** I used Claude Code, an AI coding assistant, to build the app. I described the stages and the kind of interactivity I wanted. The assistant scaffolded a Vite + React + TypeScript project and wrote the code.
3. **Model first, UI second.** The logic of the paper lives in one small file (`src/sim/model.ts`), with unit tests checking that the simulation behaves the way the paper says it should. For example, the Trojan has to survive being removed from the source. Testing the logic before building the UI caught mistakes early.
4. **Visual testing.** The app was run in a headless browser that clicked through every lab and took screenshots. That caught layout bugs, like code blocks overflowing on narrow screens and font ligatures turning `->` into `→`, which would confuse anyone reading C code.
5. **Review.** [Describe what you checked, changed or pushed back on yourself, e.g. fact-checking the timeline or rewording explanations.]

## Takeaway

Trust in software is transitive. It reaches all the way down through every tool that built the program. Reading the source code is necessary, but it isn't enough.
