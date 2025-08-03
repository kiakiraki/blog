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
updatedDate: '2025-01-16'  # オプション
heroImage: './hero-image.jpg'  # オプション
category: '競馬'  # 必須: 写真|旅行|競馬|技術|ガジェット|その他
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
export const CATEGORIES = ['写真', '旅行', '競馬', '技術', 'ガジェット', 'その他'] as const;
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

## 今後の改善案

- [ ] 全文検索機能
- [ ] コメント機能（Giscus）
- [ ] 記事の目次自動生成
- [ ] 関連記事表示
- [ ] アナリティクス連携
- [ ] PWA対応

---

このプロジェクトは継続的に改善されており、新機能の追加や既存機能の改良を歓迎します。