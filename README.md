# Astro ブログ

このプロジェクトは、Astroを使用して構築されたブログです。

https://blog.kiakiraki.dev/

## プロジェクト構造

```
├── public/
├── src/
│   ├── components/     # Astroコンポーネント
│   ├── content/        # ブログ記事などのコンテンツ
│   ├── layouts/        # ページのレイアウト
│   └── pages/          # 各ページのファイル
├── astro.config.mjs    # Astroの設定ファイル
├── package.json
└── tsconfig.json
```

- `src/pages/`: 各ページのファイルが配置されます。ファイル名に基づいてルーティングが生成されます。
- `src/components/`: 再利用可能なAstroコンポーネントを配置します。
- `src/content/`: ブログ記事などのコンテンツをMarkdownやMDX形式で管理します。
- `public/`: 画像などの静的ファイルを配置します。

## コマンド

| コマンド          | 説明                                           |
| :---------------- | :--------------------------------------------- |
| `npm install`     | 依存関係をインストールします                   |
| `npm run dev`     | 開発サーバーを起動します (`localhost:4321`)    |
| `npm run build`   | プロダクション用にビルドします (`./dist/`)     |
| `npm run preview` | ビルドされたサイトをローカルでプレビューします |

## デプロイ

このプロジェクトは [Cloudflare Pages](https://pages.cloudflare.com/)
を使用してデプロイされています。

## 参考

- [Astro ドキュメント](https://docs.astro.build/ja/)
- [Astro Discord](https://astro.build/chat)
