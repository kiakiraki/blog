// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = '趣味の記録';
export const SITE_DESCRIPTION = '趣味について雑多に書き綴るところ';

export const POSTS_PER_PAGE = 6;
export const AUTHOR_NAME = 'あきらき';
export const AUTHOR_TWITTER = '@__kiakiraki__';
export const GITHUB_URL = 'https://github.com';

export const CATEGORIES = ['写真', '旅行', '競馬', '技術', 'ガジェット', 'その他'] as const;

export type Category = (typeof CATEGORIES)[number];
