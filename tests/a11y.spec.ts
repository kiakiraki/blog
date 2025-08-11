import { test, expect } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues on the home page', async ({
    page,
  }) => {
    await page.goto('/');
    await injectAxe(page);
    const violations = await getViolations(page);
    expect(violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on a blog post page', async ({
    page,
  }) => {
    await page.goto('/blog/went-to-hakodate-racecource');
    await injectAxe(page);
    const violations = await getViolations(page);
    expect(violations).toEqual([]);
  });
});
