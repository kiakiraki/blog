// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = '趣味の記録';
export const SITE_DESCRIPTION = '趣味について雑多に書き綴るところ';

export const POSTS_PER_PAGE = 6;
export const AUTHOR_NAME = 'あきらき';
export const AUTHOR_TWITTER = '@__kiakiraki__';
export const GITHUB_URL = 'https://github.com/kiakiraki/blog';

export const CATEGORIES = ['写真', '旅行', '競馬', '技術', 'ガジェット', 'その他'] as const;

export type Category = (typeof CATEGORIES)[number];

/** Portfolio-inspired category color palette */
export const CATEGORY_COLORS: Record<Category, { fg: string; bg: string; darkBg: string }> = {
  写真: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.12)', darkBg: 'rgba(251,191,36,0.12)' },
  旅行: { fg: '#34d399', bg: 'rgba(52,211,153,0.12)', darkBg: 'rgba(52,211,153,0.12)' },
  競馬: { fg: '#a78bfa', bg: 'rgba(139,92,246,0.12)', darkBg: 'rgba(139,92,246,0.12)' },
  技術: { fg: '#38bdf8', bg: 'rgba(56,189,248,0.12)', darkBg: 'rgba(56,189,248,0.12)' },
  ガジェット: { fg: '#fb923c', bg: 'rgba(251,146,60,0.12)', darkBg: 'rgba(251,146,60,0.12)' },
  その他: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.12)', darkBg: 'rgba(148,163,184,0.12)' },
};
