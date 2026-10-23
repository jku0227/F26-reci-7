import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { matchGuess } from '../src/wordle';

// Recitation Part 1: follow along with your TA, filling in the todos below.
// Problem set Task 1: keep adding properties until `npm run mutants:wordle`
// kills every mutant. Read the spec in src/wordle/matchGuess.ts.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The result always has exactly five colors.
// (invariant, algebraic, metamorphic, differential, or conditional)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Step 1: a generator for five-letter uppercase words.
// const word = ...
const word = fc.array(fc.constantFrom(...ALPHABET.split('')), { minLength: 5, maxLength: 5 }).map(cs => cs.join(''));
const smallWord = fc.array(fc.constantFrom('A', 'B', 'C'), { minLength: 5, maxLength: 5 }).map(cs => cs.join(''));
const count = (s: string, L: string) => [...s].filter(c => c === L).length;

describe('matchGuess', () => {
  // Pattern: invariant. The output has exactly five colors, each G, Y, or B.
  it('returns exactly five colors from G, Y, B', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        const colors = matchGuess(secret, guess);
        expect(colors).toHaveLength(5);
        for (const c of colors) expect(['G', 'Y', 'B']).toContain(c);
      }),
    );
  });
 
  // Pattern: conditional. If the guess equals the secret, every color is green.
  it('guessing the secret gives all greens', () => {
    fc.assert(
      fc.property(word, w => {
        expect(matchGuess(w, w)).toEqual(['G', 'G', 'G', 'G', 'G']);
      }),
    );
  });
 
  // Pattern: invariant. A position is green iff the guess and secret letters match.
  it('is green exactly where the letters match', () => {
    fc.assert(
      fc.property(smallWord, smallWord, (secret, guess) => {
        const colors = matchGuess(secret, guess);
        for (let i = 0; i < 5; i++) expect(colors[i] === 'G').toBe(guess[i] === secret[i]);
      }),
    );
  });
 
  // Pattern: invariant. A letter is credited once for each time it appears in both the guess and the secret.
  it('credits each letter exactly min(guess count, secret count) times', () => {
    fc.assert(
      fc.property(smallWord, smallWord, (secret, guess) => {
        const colors = matchGuess(secret, guess);
        for (const L of new Set(guess)) {
          const credited = [...guess].filter((c, i) => c === L && colors[i] !== 'B').length;
          expect(credited).toBe(Math.min(count(guess, L), count(secret, L)));
        }
      }),
    );
  });
 
  // Pattern: metamorphic. Shifting both words by the same amount in the alphabet does not change the colors.
  it('is unchanged when both words are shifted through the alphabet', () => {
    const shift = (s: string, k: number) => [...s].map(c => ALPHABET[(ALPHABET.indexOf(c) + k) % 26]).join('');
    fc.assert(
      fc.property(smallWord, smallWord, fc.integer({ min: 1, max: 25 }), (secret, guess, k) => {
        expect(matchGuess(shift(secret, k), shift(guess, k))).toEqual(matchGuess(secret, guess));
      }),
    );
  });
});
