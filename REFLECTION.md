# Reflection

**Name / Andrew ID:** justinku

**Recitation group members (Task 2):** Vicky Yan, Nehemia Yonas

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

`returns exactly five colors from G, Y, B` (invariant). Kills no public
mutant since every planted bug still returns five valid colors, but still valid because
the spec says "returns five colors, one per position of `guess`". It would
catch an off-by-one loop (`i <= 5`) that appends a sixth color.

### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

`singlePass` vs. `credits each letter exactly min(guess count, secret count)
times`. The bug only fires when the guess repeats a letter that is in the
secret; `word` (26 letters) rarely repeats, so the kill was flaky:
 
```
  ~ singlePass     flaky: killed in 4/5 runs  by: credits each letter exactly min(guess count, secret count) times
      Counterexample: ["ASAAA","AAAAA"]
Mutation score: 4/5 killed (80%)
```
 
Fix: targeted generator `smallWord` over `{A, B, C}`, so every word repeats a
letter:
 
```
  ✔ singlePass     killed  by: credits each letter exactly min(guess count, secret count) times
      Counterexample: ["AAAAB","AAABB"]
Mutation score: 5/5 killed (100%)
```

### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

```
  ✔ mergesIntegerNeighbors  killed  by: returns already-disjoint sorted input unchanged
      Counterexample: [[[-19,-19],[-18,-18]]]
      AssertionError: expected [ [ -19, -18 ] ] to deeply equal [ [ -19, -19 ], [ -18, -18 ] ]
```
 
The spec says the output covers "exactly the same points as the input" and
"points means all real numbers". `-18.5` is in neither input interval, so
`[-19, -18]` adds a point the input never covered; the two must stay separate,
like the spec's `[1, 2]`, `[3, 4]` example.

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

One module that would benefit from PBT is the `read` tool in opencode (`packages/opencode/src/tool/read.ts`)
 
- **Invariant.** The output has at most `limit` lines, and every returned line
  equals the line at that number in the original file.
- **Algebraic.** Reading `[0, n)` and then `[n, m)` and concatenating gives the
  same lines as reading `[0, m)` in one call.

**Generator.** Generate random lines, join them into a file, then pick
`offset` and `limit` from its line count. A naive generator that pick independently would
mostly read past the end and test nothing, and would miss the empty file,
single line, and trailing-newline cases.