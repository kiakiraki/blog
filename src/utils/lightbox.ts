/**
 * 記事本文中の `<img>` から PhotoSwipe 用のライトボックスアイテムを組み立てるための
 * 純粋関数群。DOMに依存しないため、node:test でjsdom無しにユニットテストできる。
 */

/** srcsetの1エントリをパースした結果 */
interface SrcsetCandidate {
  url: string;
  width: number;
}

/**
 * `srcset` 属性文字列をパースし、有効な候補（url + 幅ディスクリプタ）の配列を返す。
 *
 * `srcset` の形式は `"url1 640w, url2 960w, url3 1200w"` のようなカンマ区切り。
 * `w` ディスクリプタを持たない・幅が0以下などの不正なエントリは無視する。
 *
 * @param srcset `<img>` の `srcset` 属性値（未設定・空文字列も許容）
 * @returns パースできた候補の配列（元の記述順）。全て不正なら空配列
 */
function parseSrcsetCandidates(srcset: string | null | undefined): SrcsetCandidate[] {
  if (!srcset) return [];

  const candidates: SrcsetCandidate[] = [];

  for (const rawEntry of srcset.split(',')) {
    const entry = rawEntry.trim();
    if (!entry) continue;

    // 空白区切りで "url widthDescriptor" の2トークンを期待する
    const parts = entry.split(/\s+/);
    if (parts.length < 2) continue;

    const url = parts[0];
    const descriptor = parts[1];
    const match = /^(\d+(?:\.\d+)?)w$/.exec(descriptor);
    if (!url || !match) continue;

    const width = Number(match[1]);
    if (!Number.isFinite(width) || width <= 0) continue;

    candidates.push({ url, width });
  }

  return candidates;
}

/**
 * `srcset` 属性文字列をパースし、最も幅の大きい候補のURLを返す。
 *
 * 不正な・パースできないエントリは無視する。複数の候補が最大幅で同点の場合は
 * 記述順で最初に現れたものを返す。
 *
 * @param srcset `<img>` の `srcset` 属性値（未設定・空文字列も許容）
 * @returns 最大幅の候補URL。パース可能なエントリが無ければ `undefined`
 */
export function parseSrcsetMaxWidthUrl(srcset: string | null | undefined): string | undefined {
  const candidates = parseSrcsetCandidates(srcset);
  if (candidates.length === 0) return undefined;

  return candidates.reduce((best, current) => (current.width > best.width ? current : best)).url;
}

/**
 * `srcset` から選んだ候補の幅と、`<img>` の `width`/`height` 属性値（アスペクト比の
 * 元ネタ）から、ライトボックスで表示すべき実寸の width/height を計算する。
 *
 * `width`/`height` 属性がどちらも正の数値として解釈できない場合は、アスペクト比を
 * 決定できないため `undefined` を返す（呼び出し側は naturalWidth/naturalHeight への
 * フォールバックをブラウザ環境で行う）。
 *
 * @param candidateWidth srcsetから選ばれた最大幅候補の幅（px）
 * @param widthAttr `<img>` の `width` 属性値（文字列 or 数値、未設定・不正値も許容）
 * @param heightAttr `<img>` の `height` 属性値（文字列 or 数値、未設定・不正値も許容）
 * @returns 計算済みの `{ width, height }`。計算できない場合は `undefined`
 */
export function computeScaledDimensions(
  candidateWidth: number,
  widthAttr: string | number | null | undefined,
  heightAttr: string | number | null | undefined
): { width: number; height: number } | undefined {
  const attrWidth = toPositiveNumber(widthAttr);
  const attrHeight = toPositiveNumber(heightAttr);

  if (attrWidth === undefined || attrHeight === undefined) return undefined;
  if (!Number.isFinite(candidateWidth) || candidateWidth <= 0) return undefined;

  const aspectRatio = attrHeight / attrWidth;
  return {
    width: candidateWidth,
    height: Math.round(candidateWidth * aspectRatio),
  };
}

/**
 * 1枚の `<img>` に対応するPhotoSwipeの `dataSource` アイテム（の一部）を組み立てる。
 *
 * `src` は `srcset` から解決した最大幅候補を優先し、無ければ渡された `src`
 * （`currentSrc` 等）にフォールバックする。`width`/`height`
 * は `computeScaledDimensions` で計算できた場合のみ含め、できなければ
 * `undefined`（呼び出し側でnaturalWidth/naturalHeightへフォールバック）。
 *
 * @param srcset `<img>` の `srcset` 属性値
 * @param src `<img>` の `currentSrc` あるいは `src` 属性値（srcset未解決時のフォールバック）
 * @param widthAttr `<img>` の `width` 属性値
 * @param heightAttr `<img>` の `height` 属性値
 * @returns `{ src, width, height }`。`src` が一切解決できない場合は空文字列を返す
 */
export function buildLightboxItemData(
  srcset: string | null | undefined,
  src: string | null | undefined,
  widthAttr: string | number | null | undefined,
  heightAttr: string | number | null | undefined
): { src: string; width: number | undefined; height: number | undefined } {
  const candidates = parseSrcsetCandidates(srcset);
  const best =
    candidates.length > 0 ? candidates.reduce((a, b) => (b.width > a.width ? b : a)) : undefined;

  const resolvedSrc = best?.url ?? src ?? '';

  const scaled = best ? computeScaledDimensions(best.width, widthAttr, heightAttr) : undefined;

  return {
    src: resolvedSrc,
    width: scaled?.width,
    height: scaled?.height,
  };
}

/**
 * 文字列または数値を正の有限数に変換する。変換できなければ `undefined`。
 */
function toPositiveNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return num;
}
