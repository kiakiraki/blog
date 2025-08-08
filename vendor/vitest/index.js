import assert from 'node:assert/strict';

const tests = [];

export function describe(_name, fn) {
  fn();
}

export function it(name, fn) {
  tests.push({ name, fn });
}

export const test = it;

export function expect(received) {
  return {
    toBe(expected) {
      assert.strictEqual(received, expected);
    },
    toEqual(expected) {
      assert.deepStrictEqual(received, expected);
    },
    toBeLessThan(expected) {
      assert.ok(received < expected, `${received} is not less than ${expected}`);
    }
  };
}

export async function run() {
  for (const { name, fn } of tests) {
    await fn();
    console.log(`\u2713 ${name}`);
  }
}
