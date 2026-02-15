# Astro ブログ

このプロジェクトは、Astroを使用して構築されたブログです。

https://blog.kiakiraki.dev/

## プロジェクト構造

```
├── public/
├── src/
│   ├── assets/          # 画像などのアセット
│   ├── components/      # Astroコンポーネント
│   ├── content/         # ブログ記事などのコンテンツ
│   ├── layouts/         # ページのレイアウト
│   ├── pages/           # 各ページのファイル
│   ├── styles/          # グローバルスタイル
│   ├── utils/           # ユーティリティ関数
│   └── consts.ts        # 定数定義
├── astro.config.mjs   # Astroの設定ファイル
├── package.json
└── tsconfig.json
```

- `src/assets/`: サイトで使用する画像などのアセットを管理します。
- `src/styles/`: グローバルスタイルをまとめたCSSファイルを配置します。
- `src/utils/`: 共通で使うユーティリティ関数を置きます。
- `src/consts.ts`: サイト共通の定数を定義します。
- `src/pages/`: 各ページのファイルが配置されます。ファイル名に基づいてルーティングが生成されます。
- `src/components/`: 再利用可能なAstroコンポーネントを配置します。
- `src/content/`: ブログ記事などのコンテンツをMarkdownやMDX形式で管理します。
- `public/`: 画像などの静的ファイルを配置します。

## コマンド

| コマンド             | 説明                                                                 |
| :------------------- | :------------------------------------------------------------------- |
| `npm install`        | 依存関係をインストールします                                         |
| `npm run dev`        | 開発サーバーを起動します (本番相当: dev用APIなし) (`localhost:4321`) |
| `npm run dev:editor` | 開発サーバーを起動します (MDXエディタ/開発用APIを有効化)             |
| `npm run build`      | プロダクション用にビルドします (`./dist/`)                           |
| `npm run preview`    | ビルドされたサイトをローカルでプレビューします (`wrangler dev`)      |
| `npm run deploy`     | Cloudflare Workers にデプロイします                                  |

## デプロイ

このプロジェクトは [Cloudflare Workers](https://workers.cloudflare.com/)
を使用してデプロイされています。`output: 'server'` + 全ページ `prerender = true` の構成で、
ビルド時に静的生成しつつ Workers で配信しています。

### 開発用エディタとAPIの扱い

- 本番ビルドに含めたくない開発用エディタ/画像アップロードAPIは `src/dev-pages/`
  配下にあります。
- 通常の開発 (`npm run dev`) ではこれらは提供されません。
- MDXエディタや開発用APIを使う場合は `npm run dev:editor` を利用してください。

## 開発用エディタと画像アップロード

- 開発時は `src/components/MDXEditor.astro`
  の簡易エディタから画像をアップロードできます。
- アップロード先（開発環境のみ）
  - 通常の画像（ドラッグ&ドロップ／貼り付け）:
    `src/content/blog/<YYYY-MM>/<YYYY-MM-DD>/images/<filename>`
  - ヒーロー画像（Hero アップロード）:
    `src/content/blog/<YYYY-MM>/<YYYY-MM-DD>/<filename>`
- プレビューは開発用 API を介して行われます。
  - 取得: `GET /api/dev/get-image?publishDate=YYYY-MM-DD&path=...`
  - 保存: `POST /api/dev/upload-image`
- これらの API は開発環境専用で、本番では無効化されています。

## 参考

- [Astro ドキュメント](https://docs.astro.build/ja/)
- [Astro Discord](https://astro.build/chat)
