import { getEntryBySlug } from 'astro:content';
import { ImageResponse } from '@vercel/og';
import { OgImageTemplate } from '@/components/OgImageTemplate';
import * as fs from 'node:fs/promises';
import type { APIRoute } from 'astro';

// NOTE: `import.meta.url` is not available in the test environment, so we use a relative path.
const readFont = (path: string) => {
  const isProd = import.meta.env.PROD;
  const fontPath = isProd
    ? new URL(path, import.meta.url)
    : `./public/fonts/${path.split('/').pop()}`;
  return fs.readFile(fontPath);
}

// フォントデータを非同期で読み込む
const fontRegularData = readFont('../../public/fonts/NotoSansJP-Regular.woff');
const fontBoldData = readFont('../../public/fonts/NotoSansJP-Bold.woff');

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  // `home.png` のようなリクエストに対応
  const requestSlug = slug.replace(/\.png$/, '');

  let title = '趣味の記録';
  let description = 'あきらきの趣味について記録しているブログです';
  let type = 'ブログ';
  let category = '';

  // slugから記事情報を取得
  if (requestSlug === 'home') {
    type = 'ホーム';
  } else if (requestSlug === 'about') {
    title = 'プロフィール | 趣味の記録';
    description = 'あきらき（kiakiraki）のプロフィール';
    type = 'プロフィール';
  } else {
    const post = await getEntryBySlug('blog', requestSlug);
    if (post) {
      title = post.data.title;
      description = post.data.description || '';
      category = post.data.category || '';
      type = 'ブログ記事';
    } else {
      // 見つからない場合は404を返す
      return new Response('Not Found', { status: 404 });
    }
  }

  const [fontRegular, fontBold] = await Promise.all([fontRegularData, fontBoldData]);

  // ImageResponseを使って画像を生成
  return new ImageResponse(
    OgImageTemplate({ title, description, category, type }),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontRegular,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Noto Sans JP',
          data: fontBold,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
};
