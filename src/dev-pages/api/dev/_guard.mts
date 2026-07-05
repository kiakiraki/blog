// dev専用APIの共通ガード（CSRF対策・簡易ボディサイズ制限）
//
// 注意: このファイルは意図的に `.mts` 拡張子にしている。
// astro.dev.config.mjs の devPagesIntegration は
// `src/dev-pages/**/*.{astro,ts}` を fast-glob でルート注入するため、
// 同ディレクトリに `.ts` として置くとこのヘルパー自体がAPIルートとして
// 誤登録されてしまう。`.mts` は対象外なので安全に共通処理を切り出せる。

const ALLOWED_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// http(s)問わず、Astro dev serverはデフォルトhttpだが念のため両対応。
// 実際には dev サーバは http のみだが、判定を緩めても安全側（許可範囲拡大がlocalhost限定）。

/**
 * Origin ヘッダを検証する。
 * - Origin ヘッダが無い（curl等のCLIリクエスト）場合は許可 (null を返す)
 * - `http://localhost:*` または `http://127.0.0.1:*` なら許可 (null を返す)
 * - それ以外は 403 の Response を返す
 */
export function checkOrigin(request: Request): Response | null {
  const origin = request.headers.get('origin');
  if (!origin) return null; // ブラウザ以外（CLI等）からのリクエストは許可

  if (ALLOWED_ORIGIN_PATTERN.test(origin)) return null;

  return jsonError('Forbidden: invalid origin', 403);
}

const DEFAULT_MAX_BODY_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Content-Length ヘッダによる簡易的なボディサイズ上限チェック。
 * ヘッダが無い場合はチェックをスキップする（実際の上限はストリーム側で別途担保する想定）。
 */
export function checkBodySize(
  request: Request,
  maxBytes: number = DEFAULT_MAX_BODY_BYTES
): Response | null {
  const lengthHeader = request.headers.get('content-length');
  if (!lengthHeader) return null;

  const length = Number(lengthHeader);
  if (Number.isFinite(length) && length > maxBytes) {
    return jsonError('Payload Too Large', 413);
  }

  return null;
}

/**
 * POST等の状態変更系エンドポイントの先頭で呼び出す共通ガード。
 * Origin検証とボディサイズ検証をまとめて行い、問題があれば Response を返す。
 * 問題が無ければ null を返す。
 */
export function guardMutatingRequest(
  request: Request,
  options?: { maxBodyBytes?: number }
): Response | null {
  return checkOrigin(request) ?? checkBodySize(request, options?.maxBodyBytes);
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
