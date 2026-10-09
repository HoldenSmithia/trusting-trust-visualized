# Reflection

Note: Both of us collaborated on this and Holden was just the scribe.

## What We built

For Problem 1, We chose Ken Thompson's paper on Trusting the Trust that you mentioned briefly in class. We had AI summarize the parts that included trusting a compiler and certain vulnerabilities. We also read this paper here: https://www.cs.cmu.edu/~rdriley/487/papers/Thompson_1984_ReflectionsonTrustingTrust.pdf. We just built a simple react app based on some of the principles of the paper, and had Claude generate the page and some code examples, as well as a "compiler sim" to see what C code outputs once compiled and ran.

## How it deepened my understanding

The interactive components and the little exercises on the webpage walked us through the basics first and got more complex. It started with a program printing itself and how it is important for manipulating the compiler behavior because the compiler is written in C. In stage II, there is an interactive component that covers what we learned about in class with "teaching" the compiler to recognize an ASCII character so you can use it later. Stage III helped us visualize what putting in a "trojan" looks like by adding in the trojan, compiling, then removing the trojan, compiling the clean version of the compiler and then compiling the login file afterwards which will then allow you to login with the master password. Since Ken Thompson doesn't really explain any countermeasures besides not trusting source code, there is a section including a paper by David Wheeler on Diverse Double-Compiling. This is essentially when you use a different compiler to verify the original compiler's code and check the byte output of the original compiler by compiling twice to see if the byte output is different. This was new learning for us so it was cool to see that there are countermeasures for verifying important source code.

## Workflow

1. **AI-assisted development.** We used Claude Code, an AI coding assistant, to build the app. We described the stages and the kind of interactivity We wanted. The assistant scaffolded a Vite + React + TypeScript project and wrote the code.
2. **Model first, UI second.** The logic of the paper lives in one small file (`src/sim/model.ts`), with unit tests checking that the simulation behaves the way the paper says it should. For example, the Trojan has to survive being removed from the source. Testing the logic before building the UI caught mistakes early.
3. **Visual testing.** The app was run in a headless browser that clicked through every lab and took screenshots. That caught layout bugs, like code blocks overflowing on narrow screens and font ligatures turning `->` into `→`, which would confuse anyone reading C code. We didn't totally need it for this assignment but it's still there.
4. **Review.** I went through the entire page and all the exercises and checked it against the original paper. For the timeline, I looked up the dates mentioned to make sure that they were correct.

## Takeaway

We learned more about the importance of what goes into source code (especially compilers). We also reinforced our learning on how trojans can be inserted and used to malicious hackers' advantages. A cool takeaway which we mentioned earlier was the section on DDC. Lastly, a cool part was all of the other examples included in the timeline where popular software was exploited which underlined the importance of reading source code and understanding where it could be vulnerable.
