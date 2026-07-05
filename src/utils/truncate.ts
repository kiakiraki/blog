const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

/**
 * 文字列を書記素クラスタ（見た目上の1文字）単位で切り詰める
 *
 * String.prototype.substring はUTF-16コードユニット単位で切るため、
 * サロゲートペア（絵文字など）やZWJ合成絵文字を途中で破壊しうる。
 * Intl.Segmenter で書記素単位に分割してから切り詰めることでこれを防ぐ。
 *
 * @param text 対象の文字列
 * @param maxGraphemes 最大書記素数
 * @param ellipsis 切り詰め時に付与する省略記号（デフォルト: '…'）
 * @returns 書記素数が maxGraphemes 以下ならそのまま、超える場合は先頭
 *          maxGraphemes 書記素 + 省略記号
 */
export function truncateGraphemes(
  text: string,
  maxGraphemes: number,
  ellipsis: string = '…'
): string {
  const graphemes = [...segmenter.segment(text)];
  if (graphemes.length <= maxGraphemes) {
    return text;
  }
  return (
    graphemes
      .slice(0, maxGraphemes)
      .map(({ segment }) => segment)
      .join('') + ellipsis
  );
}
