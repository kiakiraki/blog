# CLAUDE.md - AI Assistant Project Context

## プロジェクト概要

このプロジェクトは、Astroを使用して構築された個人ブログサイトです。競馬、旅行、ガジェット、技術などの趣味に関する記事を投稿・管理しています。

- **サイトURL**: https://blog.kiakiraki.dev
- **技術スタック**: Astro + TypeScript + Tailwind CSS + MDX
- **デプロイ**: Cloudflare Pages
- **コンテンツ**: 日本語ブログ記事（競馬、旅行、ガジェット、技術）

## プロジェクト構造

```
/
├── public/                 # 静的ファイル
│   ├── favicon.svg
│   ├── fonts/             # カスタムフォント
│   └── robots.txt
├── src/
│   ├── assets/            # 画像アセット
│   ├── components/        # 再利用可能なAstroコンポーネント
│   │   ├── BaseHead.astro      # HTMLヘッダー
│   │   ├── Header.astro        # サイトヘッダー（カテゴリナビ付き）
│   │   ├── Footer.astro        # サイトフッター
│   │   ├── ThemeToggle.astro   # ダーク/ライトモード切替
│   │   ├── FormattedDate.astro # 日付フォーマット
│   │   ├── TweetButton.astro   # Twitterシェアボタン
│   │   ├── CaptionedImage.astro # キャプション付き画像
│   │   ├── ImageGrid.astro     # 画像グリッド表示
│   │   ├── TableOfContents.astro # 自動目次生成（レスポンシブ対応）
│   │   └── HeaderLink.astro    # ナビゲーションリンク
│   ├── content/
│   │   └── blog/          # ブログ記事（MDX形式）
│   │       └── 2025-07/   # 年月別ディレクトリ構造
│   ├── layouts/
│   │   ├── Layout.astro        # ベースレイアウト
│   │   └── BlogPost.astro      # ブログ記事レイアウト
│   ├── pages/
│   │   ├── index.astro         # ホームページ
│   │   ├── about.astro         # プロフィールページ
│   │   ├── blog/
│   │   │   ├── index.astro     # ブログ一覧（カテゴリフィルタ付き）
│   │   │   └── [...slug].astro # 動的ブログ記事ページ
│   │   ├── category/
│   │   │   └── [category].astro # 動的カテゴリページ
│   │   ├── og/
│   │   │   └── [...slug].svg.ts # OGP画像生成
│   │   └── rss.xml.js          # RSS フィード
│   ├── styles/
│   │   └── global.css     # グローバルスタイル（Tailwind CSS）
│   ├── consts.ts          # サイト定数・カテゴリ定義
│   └── content.config.ts  # コンテンツスキーマ定義
├── astro.config.mjs       # Astro設定
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

# プロダクションビルド
npm run build

# プレビュー
npm run preview

# コード品質チェック
npm run lint          # ESLint自動修正
npm run lint:check    # ESLintチェックのみ
npm run format        # Prettier自動フォーマット
npm run format:check  # Prettierチェックのみ
npm run typecheck     # TypeScript型チェック
```

### 🛠️ 技術スタック詳細

#### フレームワーク・ライブラリ

- **Astro 5.12.5**: 静的サイトジェネレーター
- **TypeScript 5.8.3**: 型安全性
- **Tailwind CSS 4.1.11**: ユーティリティファーストCSS
- **MDX 4.3.0**: Markdown + JSX

#### デプロイ・インフラ

- **Cloudflare Pages**: ホスティング・CDN
- **Cloudflare KV**: セッション管理
- **Sharp**: 画像最適化

#### 開発ツール

- **ESLint 9.31.0**: コード品質
- **Prettier 3.6.2**: コードフォーマット
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

## 実装待ちの改善リスト

### 🔍 検索・ナビゲーション機能

- [ ] **全文検索機能**
  - 優先度: 高
  - 概要: ブログ記事タイトル・本文からのキーワード検索
  - 技術案: Algolia / Lunr.js / Fuse.js
  - 実装箇所: `/search` ページ + ヘッダー検索ボックス

- [ ] **関連記事表示**
  - 優先度: 中
  - 概要: 記事下部に同カテゴリ・類似記事を表示
  - 技術案: カテゴリ・タグベース + 文章類似度
  - 実装箇所: `BlogPost.astro` 記事フッター

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

- [ ] **画像ギャラリー強化**
  - 優先度: 中
  - 概要: Lightbox・スワイプ対応・拡大表示
  - 技術案: PhotoSwipe / Swiper.js
  - 実装箇所: `ImageGrid.astro` 拡張

- [ ] **記事シェア機能拡張**
  - 優先度: 低
  - 概要: Line・Facebook・はてなブックマーク対応
  - 実装箇所: `TweetButton.astro` → `ShareButtons.astro`

### 🔧 管理・メンテナンス

- [ ] **サイトマップXML自動生成**
  - 優先度: 低
  - 概要: SEO向けサイトマップ（現在は手動RSS）
  - 技術案: Astro Sitemap統合
  - 実装箇所: `/sitemap.xml`

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
