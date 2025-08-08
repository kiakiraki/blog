export function describe(name: string, fn: () => void): void;
export function it(name: string, fn: () => any): void;
export const test: typeof it;
export function expect(received: any): {
  toBe(expected: any): void;
  toEqual(expected: any): void;
  toBeLessThan(expected: any): void;
};
export function run(): Promise<void>;
