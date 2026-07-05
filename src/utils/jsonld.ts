/**
 * JSON-LD構造化データを <script type="application/ld+json"> へ安全に埋め込むための
 * シリアライザ。JSON.stringify は `<` をエスケープしないため、値に `</script>` が
 * 含まれるとタグが早期終了しHTMLインジェクションにつながる。`<` をUnicode
 * エスケープシーケンスに変換することでこれを防ぐ（JSONとしての意味は変わらない）。
 */
export function jsonLdStringify(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
