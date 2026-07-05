/**
 * astro:content に依存しない、ページネーション・カテゴリ集計の純粋ロジック。
 */

export interface PageSlice {
  start: number;
  end: number;
  totalPages: number;
}

/**
 * ページ番号・1ページあたりの件数・総件数から、配列の slice 範囲と総ページ数を計算する。
 * @param page ページ番号（1始まり）
 * @param postsPerPage 1ページあたりの件数
 * @param totalPosts 総件数
 */
export function calculatePageSlice(
  page: number,
  postsPerPage: number,
  totalPosts: number
): PageSlice {
  const totalPages = postsPerPage > 0 ? Math.ceil(totalPosts / postsPerPage) : 0;
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;

  return { start, end, totalPages };
}

/**
 * 指定ページの記事一覧・総件数・総ページ数を返す。
 * @param items 全件の配列
 * @param page ページ番号（1始まり）
 * @param postsPerPage 1ページあたりの件数
 */
export function paginate<T>(
  items: T[],
  page: number,
  postsPerPage: number
): { items: T[]; totalItems: number; totalPages: number } {
  const totalItems = items.length;
  const { start, end, totalPages } = calculatePageSlice(page, postsPerPage, totalItems);

  return {
    items: items.slice(start, end),
    totalItems,
    totalPages,
  };
}

/**
 * カテゴリごとの件数を集計する。
 * @param categories 集計対象のカテゴリ一覧（順序を保持する）
 * @param itemCategories 各アイテムのカテゴリ値
 */
export function countByCategory<C extends string>(
  categories: readonly C[],
  itemCategories: readonly string[]
): Record<C, number> {
  return categories.reduce(
    (acc, category) => {
      acc[category] = itemCategories.filter(c => c === category).length;
      return acc;
    },
    {} as Record<C, number>
  );
}
