# CLAUDE.md - AI Assistant Project Context

## プロジェクト概要

このプロジェクトは、Astroを使用して構築された個人ブログサイトです。競馬、旅行、ガジェット、技術などの趣味に関する記事を投稿・管理しています。

- **サイトURL**: https://blog.kiakiraki.dev
- **技術スタック**: Astro + TypeScript + Tailwind CSS + MDX
- **デプロイ**: Cloudflare Workers
- **コンテンツ**: 日本語ブログ記事（競馬、旅行、ガジェット、技術）

## プロジェクト構造

```
/
├── public/                 # 静的ファイル
│   ├── _headers           # セキュリティヘッダ・キャッシュ設定（Cloudflare）
│   ├── favicon.svg
│   ├── fonts/             # カスタムフォント（Noto Sans JP woff）
│   └── robots.txt
├── src/
│   ├── assets/            # 画像アセット
│   ├── components/        # 再利用可能なAstroコンポーネント
│   │   ├── BaseHead.astro      # HTMLヘッダー（OGP/構造化データ）
│   │   ├── Header.astro        # サイトヘッダー（カテゴリナビ付き）
│   │   ├── Footer.astro        # サイトフッター
│   │   ├── ThemeToggle.astro   # ダーク/ライトモード切替
│   │   ├── FormattedDate.astro # 日付フォーマット
│   │   ├── PostCard.astro      # 記事カード（heroImage無し時はOGP画像をサムネイルに流用）
│   │   ├── FeaturedPostCard.astro # トップページの最新記事フィーチャーカード
│   │   ├── CategoryBadge.astro # カテゴリバッジ
│   │   ├── RelatedPosts.astro  # 関連記事表示
│   │   ├── TweetButton.astro   # X (Twitter) シェアボタン
│   │   ├── CaptionedImage.astro # キャプション付き画像
│   │   ├── ImageGrid.astro     # 画像グリッド表示
│   │   ├── ImageLightbox.astro # 記事内画像の拡大表示（PhotoSwipe）
│   │   ├── TableOfContents.astro # 自動目次生成（レスポンシブ対応）
│   │   ├── Icon.astro          # SVGアイコン集
│   │   ├── HeaderLink.astro    # ナビゲーションリンク
│   │   └── editor/             # dev専用MDXエディタ（React）
│   ├── content/
│   │   └── blog/          # ブログ記事（MDX形式）
│   │       └── YYYY-MM/YYYY-MM-DD/ # 年月日別ディレクトリ構造
│   ├── dev-pages/         # 開発時のみ注入されるページ・API（エディタ等）
│   ├── layouts/
│   │   ├── Layout.astro        # ベースレイアウト
│   │   └── BlogPost.astro      # ブログ記事レイアウト
│   ├── lib/
│   │   ├── rehype-link-preview.js # 単独リンク段落→リンクカード変換
│   │   └── mdx-processor.ts    # devエディタのプレビュー用MDX処理
│   ├── pages/
│   │   ├── index.astro         # ホームページ
│   │   ├── about.astro         # プロフィールページ
│   │   ├── 404.astro           # Not Foundページ
│   │   ├── blog/
│   │   │   ├── index.astro     # ブログ一覧（1ページ目）
│   │   │   ├── page/[page].astro # ブログ一覧（2ページ目以降）
│   │   │   └── [...slug].astro # 動的ブログ記事ページ
│   │   ├── category/
│   │   │   └── [category].astro # 動的カテゴリページ
│   │   ├── og/
│   │   │   └── [...slug].png.ts # OGP画像生成（satori + sharp）
│   │   └── rss.xml.js          # RSS フィード
│   ├── styles/
│   │   ├── global.css     # グローバルスタイル（セマンティックトークン・Tailwind CSS）
│   │   └── fonts.css      # 自己ホストフォントの@font-face定義（自動生成部分含む）
│   ├── utils/
│   │   ├── posts.ts            # 記事取得・ページネーション・カテゴリ集計
│   │   ├── relatedPosts.ts     # 関連記事スコアリング
│   │   └── lightbox.ts         # ライトボックス用srcsetパース・寸法計算
│   ├── consts.ts          # サイト定数・カテゴリ定義
│   └── content.config.ts  # コンテンツスキーマ定義
├── test/                  # node --test によるユニットテスト
├── astro.config.mjs       # Astro設定（本番）
├── astro.dev.config.mjs   # Astro設定（devエディタ用、dev-pagesを注入）
├── wrangler.jsonc         # Cloudflare Workers設定
├── package.json           # 依存関係とスクリプト
├── tsconfig.json          # TypeScript設定
└── eslint.config.js       # ESLint設定
```

## 主要機能

### 🎯 ブログシステム

- **MDX記事**: Markdown + JSXコンポーネント対応
- **画像最適化**: 自動WebP変換、レスポンシブ画像
- **日付別整理**: `/blog/YYYY-MM/YYYY-MM-DD/slug` 構造
- **RSS配信**: `/rss.xml`

### 🏷️ カテゴリシステム

- **定義済みカテゴリ**: 写真、旅行、競馬、技術、ガジェット、その他
- **クライアントサイドフィルタ**: ブログ一覧でのリアルタイム絞り込み
- **カテゴリページ**: `/category/[カテゴリ名]` で個別表示
- **ナビゲーション**: ヘッダーにドロップダウンメニュー

### 🎨 UI/UX

- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **ダークモード**: システム設定対応 + 手動切替
- **日本語フォント**: Noto Sans JP使用
- **アクセシビリティ**: ARIAラベル、キーボードナビゲーション

### 📋 記事ナビゲーション

- **自動目次生成**: h2-h4見出しから目次を自動抽出・表示
  - デスクトップ：右サイドバーに固定表示
  - モバイル：記事上部に折りたたみ式表示
  - スクロール連動ハイライト（Intersection Observer）
  - スムーズスクロールナビゲーション
- **前後記事ナビ**: 時系列順での記事移動
- **カテゴリバッジ**: 記事からカテゴリフィルタへのリンク

### 📤 SNS連携

- **Twitterシェア**: 記事にシェアボタン
- **OGP画像**: 動的生成（Satori使用）

## 開発環境

### 📋 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# MDXエディタ付き開発サーバー（/editor が使える）
npm run dev:editor

# プロダクションビルド
npm run build

# プレビュー（wrangler dev）
npm run preview

# デプロイ
npm run deploy

# テスト（node --test）
npm test

# コード品質チェック
npm run lint          # ESLint自動修正
npm run lint:check    # ESLintチェックのみ
npm run format        # Prettier自動フォーマット
npm run format:check  # Prettierチェックのみ
npm run typecheck     # TypeScript型チェック
```

### 🛠️ 技術スタック詳細

#### フレームワーク・ライブラリ

- **Astro 7.x**: 静的サイトジェネレーター（output:
  'server' + 全ページ prerender）
- **TypeScript 6.x**: 型安全性
- **Tailwind CSS 4.x**: ユーティリティファーストCSS
- **@astrojs/mdx 7.x**: Markdown + JSX
- **React 19**: devエディタ専用（本番ビルドには含まれない）

#### デプロイ・インフラ

- **Cloudflare Workers**: ホスティング・CDN
- **Wrangler**: Workers CLI・ローカルプレビュー
- **Sharp / Satori**: 画像最適化・OGP画像生成（ビルド時のみ）

#### 開発ツール

- **ESLint 9.x**: コード品質
- **Prettier 3.x**: コードフォーマット
- **Astro Check**: 型チェック

## コンテンツ管理

### 📝 ブログ記事作成

新しい記事は以下の構造で作成：

```
src/content/blog/YYYY-MM/YYYY-MM-DD/
├── article-slug.mdx
├── hero-image.jpg
└── other-images.jpg
```

#### フロントマター例

```yaml
---
title: '記事タイトル'
description: '記事の説明'
pubDate: '2025-01-15'
updatedDate: '2025-01-16' # オプション
heroImage: './hero-image.jpg' # オプション
category: '競馬' # 必須: 写真|旅行|競馬|技術|ガジェット|その他
---
```

### 🖼️ 画像の使用方法

```jsx
// Astroコンポーネントでの画像使用
import { Image } from 'astro:assets';
import heroImage from './hero-image.jpg';

<Image src={heroImage} alt="説明" width={800} height={400} />

// MDXでの画像使用
![画像説明](./image.jpg)

// カスタムコンポーネント使用
<CaptionedImage src="./image.jpg" alt="説明" caption="キャプション" />

<ImageGrid
  images={[image1, image2, image3]}
  captions={['説明1', '説明2', '説明3']}
/>
```

## 設定・カスタマイズ

### 🔧 サイト設定

主要な設定は `src/consts.ts` で管理：

```typescript
export const SITE_TITLE = '趣味の記録';
export const SITE_DESCRIPTION = '趣味について雑多に書き綴るところ';
export const AUTHOR_NAME = 'あきらき';
export const AUTHOR_TWITTER = '@__kiakiraki__';
export const CATEGORIES = [
  '写真',
  '旅行',
  '競馬',
  '技術',
  'ガジェット',
  'その他',
] as const;
```

### 🎨 スタイルカスタマイズ

- **プライマリカラー**: `src/styles/global.css` で定義
- **ダークモード**: 自動対応（TailwindCSS）
- **フォント**: Noto Sans JP + JetBrains Mono

## 注意事項・制約

### ⚠️ 重要な制約

- **カテゴリ**: 必ず `CATEGORIES` で定義された値を使用
- **画像**: 記事と同じディレクトリに配置
- **日付形式**: `YYYY-MM-DD` 形式必須
- **ファイル名**: 記事URLに影響するため適切な命名を
- **lockfile**: CIと同じ npm 10系で生成する（`npx -y npm@10.9.2 install`）。npm
  11だとoptional依存の配置が変わりCIの `npm ci` が失敗する
- **compatibility_date**: `wrangler.jsonc`
  の値は同梱workerdの対応日付を超えられない。上げるときは `wrangler` /
  `@astrojs/cloudflare` も同じPRで更新する
- **ビルド時画像最適化**: `astro.config.mjs` の `image.service` は
  `src/lib/build-image-service.mjs`（sharpの再エクスポート）を指定している。
  `imageService: 'compile'` + `prerenderEnvironment: 'node'`
  の組み合わせではアダプタがno-opサービスへ強制差し替えし、srcset候補が未縮小の元画像コピーになる（.webp拡張子で中身JPEG）ための回避策。
  `@astrojs/cloudflare`
  更新時はビルド後にsrcset候補が実際に縮小されているか確認すること
- **画像のwidth+height両指定は実クロップになる**: `astro.config.mjs` で
  `image.layout: 'constrained'` を設定している（Markdown `![]()`
  画像にも自動でsrcset/sizesが付く）ため、`<Image>`
  に width と height を両方渡すと `fit`（デフォルト
  `cover`）でその縦横比に実際に切り抜かれる。従来のような「HTML属性に出るだけ」ではない。コンポーネント内部で寸法をハードコードしない（ImageGridの縦長画像クロップ退行の教訓、PR
  #331で修正）。画像パイプライン変更時は「srcset候補の宣言幅と実寸の一致」に加えて「元画像との縦横比の一致」まで確認すること
- **CSP追随**: 記事に新しい種類の外部埋め込み（現状はYouTube /
  Twitterのみ許可）を追加したら `public/_headers` のCSPにドメインを追加する

### 🔒 セキュリティ

- **環境変数**: 機密情報は `.env` で管理
- **画像**: Sharp による最適化・検証
- **XSS対策**: Astroによる自動エスケープ

### 📱 パフォーマンス

- **画像最適化**: 自動WebP変換
- **静的生成**: ビルド時プリレンダリング
- **CSS**: 使用分のみ出力（Tailwind CSS）

## トラブルシューティング

### 🐛 よくある問題

1. **ビルドエラー**: `npm run typecheck` で型エラーを確認
2. **画像表示されない**: 相対パス・ファイル名を確認
3. **カテゴリエラー**: `CATEGORIES` 定義値と一致するか確認
4. **スタイル適用されない**: Tailwind CSS クラス名を確認

### 🔍 デバッグ情報

- **開発サーバー**: http://localhost:4321
- **ビルド出力**: `dist/` ディレクトリ
- **ログ**: ブラウザコンソール・ターミナル出力を確認

## 実装済み機能

### ✅ 完了済み

- [x] **カテゴリシステム** - ブログ記事のカテゴリ分類・フィルタ機能
- [x] **自動目次生成** - h2-h4見出しから目次を自動生成、スクロール連動ハイライト
- [x] **レスポンシブTOC** - デスクトップ：サイドバー固定、モバイル：折りたたみ式
- [x] **サイトマップXML自動生成** - Astro Sitemap統合（`/sitemap-index.xml`）
- [x] **関連記事表示** - カテゴリ・時系列・タイトル類似度によるスコアリング（`utils/relatedPosts.ts`）
- [x] **リンクカード** - 単独リンク段落をOGP付きリンクカードへ変換（`lib/rehype-link-preview.js`）
- [x] **ページネーション** - `/blog/`（1ページ目）+
      `/blog/page/[page]/`（2ページ目以降）
- [x] **MDXエディタ（dev専用）** - `npm run dev:editor` で `/editor`
      から記事作成・画像アップロード
- [x] **View Transitions** -
      ClientRouterによるクライアントサイド遷移。カードのヒーロー画像が記事ヒーローへモーフ（`transition:name="hero-{id}"`）。動的スクリプトは
      `astro:page-load` + AbortControllerで冪等化、テーマは `astro:after-swap`
      で再適用
- [x] **画像ライトボックス** - PhotoSwipe
      v5による記事内画像の拡大表示（`ImageLightbox.astro` +
      `utils/lightbox.ts`）。本文（`.prose`）内の画像を1ギャラリーとしてスワイプ・矢印キーで前後移動。srcset最大幅候補を拡大表示に使用、PhotoSwipe本体は遅延ロード（npmバンドルのためCSP変更不要）。`<a>`
      内の画像とヒーロー画像は対象外。Enter/Spaceでも開ける（`role="button"` +
      `tabindex="0"` 付与）

## 実装待ちの改善リスト

### 🧹 コードレビュー由来の残課題（2026-07 包括レビュー、PR #314 / #316 対応後の見送り分）

- [ ] **CSPの `unsafe-inline` 排除（nonce化）**
  - 優先度: 低（`jsonLdStringify` によるJSON-LDエスケープ済みで実リスクは低い）
  - 概要: `public/_headers`
    は静的ファイルでnonceを埋め込めないため、ミドルウェアでのCSPヘッダ動的生成への移行が必要（工数大）
- [x] **CSPから `fonts.googleapis.com` / `fonts.gstatic.com` を削除**（対応済み:
      2026-07-05, PR #324）
  - あわせてPR #327で記事内埋め込み用のCSP許可を追加（`script-src` に
    `data:`（AstroのClientRouterがインラインmoduleスクリプトの実行完了待ちに空の
    `data:` スクリプトを挿入するため）と `platform.twitter.com`、`frame-src` に
    `www.youtube.com` / `platform.twitter.com` / `syndication.twitter.com`）
  - 教訓: 記事に新しい種類の外部埋め込みを追加したら `public/_headers`
    のCSPも追随すること
- [x] **ESLint 10へのメジャー更新**（対応済み）
  - 概要: `eslint` ^10.6.0 / `eslint-plugin-astro` ^2.1.1 /
    `typescript-eslint`系 ^8.62.1 に更新し、`eslint-plugin-jsx-a11y` （ESLint
    9までしか対応せず10と共存不可）は削除。a11yルール（`astro/jsx-a11y/*`）はeslint-plugin-astro
    v2で`jsx-a11y-recommended`/`jsx-a11y-strict`という別configに切り出された形になり、jsx-a11y未インストールでも`configs.all`はエラーなく動作するため設定変更は最小限で済んだ。
  - 残タスク: a11yルールは一時的に削除した状態。`eslint-plugin-jsx-a11y`
    が公式にESLint 10対応したら`jsx-a11y-recommended`/`jsx-a11y-strict`
    configの追加で復帰する。2026-07-05に再調査した結果は「引き続き待ち」: 本家はESLint
    10対応PRがblockedのまま（issue #1075）、フォーク `eslint-plugin-jsx-a11y-x`
    はnpmエイリアスでの差し替えがeslint-plugin-astroのローダーと非互換（CJS
    interop + ルール名prefix不一致）と実機検証で確認済み。再チェック目安は2026年9〜10月（`npm view eslint-plugin-jsx-a11y peerDependencies`
    を確認）。
  - 副作用:
    v2で新規追加された`astro/no-omitted-end-tags`ルールは、`<head>`直下にカスタムコンポーネント（例:
    `<BaseHead>`）を置くだけで誤検知するバグがあり、作者自身がルール非推奨化PRを出している（ota-meshi/eslint-plugin-astro
    PR #590）ため `eslint.config.js`でoffにした。
- [x] **内部リンクの末尾スラッシュ統一**（対応済み: 2026-07-05, PR #325）
  - `trailingSlash: 'always'` は `/og/*.png`
    のprerenderが壊れるため設定しない（理由は `astro.config.mjs`
    のコメント参照）。Workers assetsのauto-trailing-slashが `/blog` → `/blog/`
    へ307するのはwrangler devで検証済み
- [x] **OGP画像タイトル切り詰めのサロゲートペア対応**（対応済み: 2026-07-05, PR
      #323）
  - `Intl.Segmenter` による書記素クラスタ単位の `truncateGraphemes`
    （`src/utils/truncate.ts`）に置換。説明文（80文字）側も同時修正

### 🔍 検索・ナビゲーション機能

- [ ] **全文検索機能**
  - 優先度: 高
  - 概要: ブログ記事タイトル・本文からのキーワード検索
  - 技術案: Algolia / Lunr.js / Fuse.js
  - 実装箇所: `/search` ページ + ヘッダー検索ボックス

- [ ] **ブレッドクラム強化**
  - 優先度: 低
  - 概要: カテゴリページのナビゲーション改善
  - 実装箇所: 全ページ共通ヘッダー下

### 📊 エンゲージメント・分析

- [ ] **コメント機能（Giscus）**
  - 優先度: 中
  - 概要: GitHub Discussionsベースのコメントシステム
  - 技術案: Giscus統合
  - 実装箇所: `BlogPost.astro` 記事下部

- [ ] **読了時間表示**
  - 優先度: 低
  - 概要: 記事の推定読了時間を表示
  - 技術案: 文字数ベース計算（日本語：400字/分）
  - 実装箇所: `BlogPost.astro` ヘッダー

- [ ] **アナリティクス連携**
  - 優先度: 中
  - 概要: Google Analytics / Plausible Analytics
  - 実装箇所: `BaseHead.astro` + privacy-friendly設定

### 📱 UX・パフォーマンス改善

- [ ] **PWA対応**
  - 優先度: 低
  - 概要: オフライン閲覧・アプリライク体験
  - 技術案: Service Worker + Web App Manifest
  - 実装箇所: `/public/manifest.json` + SW登録

- [x] **画像ギャラリー強化**（対応済み: 2026-07-05, PR #330 / #331）
  - PhotoSwipe
    v5によるライトボックスを実装（`ImageLightbox.astro`）。詳細は「実装済み機能」参照
  - あわせて `image.layout: 'constrained'` でMarkdown `![]()`
    画像もレスポンシブ化（PR #331）

- [ ] **記事シェア機能拡張**
  - 優先度: 低
  - 概要: Line・Facebook・はてなブックマーク対応
  - 実装箇所: `TweetButton.astro` → `ShareButtons.astro`

### 🔧 管理・メンテナンス

- [ ] **記事下書き機能**
  - 優先度: 低
  - 概要: 未公開記事のプレビュー
  - 技術案: frontmatter `draft: true` フラグ
  - 実装箇所: コンテンツ収集時のフィルタ

- [ ] **タグシステム**
  - 優先度: 中
  - 概要: カテゴリより細かい分類
  - 技術案: frontmatter `tags: []` + タグページ
  - 実装箇所: `/tags/[tag].astro`

### 💡 コンテンツ機能

- [ ] **記事シリーズ機能**
  - 優先度: 低
  - 概要: 連載記事の前後ナビゲーション
  - 技術案: frontmatter `series: string` + 順序
  - 実装箇所: `BlogPost.astro` 記事ナビ強化

- [ ] **写真EXIF情報表示**
  - 優先度: 低
  - 概要: 撮影データ（カメラ・設定）表示
  - 技術案: ExifReader + カスタムコンポーネント
  - 実装箇所: `CaptionedImage.astro` 拡張

### 実装優先度について

- **高**: 基本的なユーザビリティに直結
- **中**: エンゲージメント・回遊性向上
- **低**: 利便性・差別化要素

---

このプロジェクトは継続的に改善されており、新機能の追加や既存機能の改良を歓迎します。
