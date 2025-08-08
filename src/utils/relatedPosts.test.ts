import { describe, it, expect, run } from 'vitest';
import { getRelatedPosts } from './relatedPosts.js';

type TestPost = any;

const createPost = (
  id: string,
  title: string,
  category: string,
  date: string,
): TestPost => ({
  id,
  data: {
    title,
    category,
    pubDate: new Date(date),
  },
});

describe('getRelatedPosts', () => {
  it('prioritizes posts from the same category', () => {
    const current = createPost('current', 'Current', '技術', '2025-01-01');
    const sameCat = createPost('same', 'Same Cat', '技術', '2025-01-02');
    const diffCat = createPost('diff', 'Diff Cat', '旅行', '2025-01-02');

    const result = getRelatedPosts(current, [sameCat, diffCat]);
    expect(result[0].id).toBe('same');
  });

  it('penalizes older publication dates', () => {
    const current = createPost('current', 'Current', '技術', '2025-01-01');
    const recent = createPost('recent', 'Recent', '技術', '2025-01-02');
    const old = createPost('old', 'Old', '技術', '2024-01-02');

    const result = getRelatedPosts(current, [recent, old]);
    expect(result[0].id).toBe('recent');
  });

  it('accounts for title similarity', () => {
    const current = createPost('current', 'Hello World', '技術', '2025-01-01');
    const similar = createPost('similar', 'Hello World!', '技術', '2025-01-02');
    const different = createPost('different', 'Another Topic', '技術', '2025-01-02');

    const result = getRelatedPosts(current, [similar, different]);
    expect(result[0].id).toBe('similar');
  });
});

await run();
