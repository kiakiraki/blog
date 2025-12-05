import satori from 'satori';
import sharp from 'sharp';
import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES } from '../../consts';
import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';

export const prerender = true;

// Load fonts from public directory at build time
const fontsDir = path.join(process.cwd(), 'public/fonts');
const fontRegular = fs.readFileSync(path.join(fontsDir, 'noto-sans-jp-400.woff'));
const fontBold = fs.readFileSync(path.join(fontsDir, 'noto-sans-jp-700.woff'));

type Props = {
  post?: CollectionEntry<'blog'>;
  categoryPage?: string;
};

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const paths = posts.map(post => ({
    params: { slug: post.id },
    props: { post } as Props,
  }));

  paths.push(
    { params: { slug: 'home' }, props: {} as Props },
    { params: { slug: 'about' }, props: {} as Props }
  );

  // Add category pages
  CATEGORIES.forEach(category => {
    paths.push({
      params: { slug: `category-${category}` },
      props: { categoryPage: category } as Props,
    });
  });

  return paths;
}

function h(type: string, props: Record<string, unknown> = {}, ...children: unknown[]): unknown {
  return { type, props: { ...props, children: children.length > 1 ? children : children[0] } };
}

export async function GET({ params, props }: APIContext<Props>) {
  const { slug } = params;

  let title = '趣味の記録';
  let description = 'あきらきの趣味について記録しているブログです';
  let type = 'ブログ';
  let category = '';

  if (props.post) {
    title = props.post.data.title;
    description = props.post.data.description || '';
    category = props.post.data.category || '';
    type = 'ブログ記事';
  } else if (props.categoryPage) {
    title = `${props.categoryPage}の記事一覧`;
    description = `${props.categoryPage}に関する記事を表示しています`;
    category = props.categoryPage;
    type = 'カテゴリ';
  } else if (slug === 'home') {
    title = '趣味の記録';
    description = 'あきらきの趣味について記録しているブログです';
    type = 'ホーム';
  } else if (slug === 'about') {
    title = 'プロフィール | 趣味の記録';
    description = 'あきらき（kiakiraki）のプロフィール';
    type = 'プロフィール';
  }

  const element = h(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        background: 'linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)',
        position: 'relative',
        fontFamily: 'Noto Sans JP',
      },
    },
    h(
      'div',
      {
        style: {
          position: 'absolute',
          top: '100px',
          left: '100px',
          width: '1000px',
          height: '430px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        },
      },
      h(
        'div',
        {
          style: {
            position: 'absolute',
            top: '50px',
            left: '50px',
            background: '#0ea5e9',
            borderRadius: '20px',
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 600,
          },
        },
        type
      ),
      category
        ? h(
            'div',
            {
              style: {
                position: 'absolute',
                top: '50px',
                right: '50px',
                background: '#f3f4f6',
                borderRadius: '20px',
                padding: '8px 16px',
                color: '#374151',
                fontSize: '16px',
                fontWeight: 500,
              },
            },
            category
          )
        : null,
      h(
        'div',
        {
          style: {
            marginTop: title.length > 30 ? '40px' : '20px',
            fontSize: title.length > 30 ? '42px' : '56px',
            fontWeight: 800,
            color: '#1f2937',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
          },
        },
        title.length > 50 ? title.substring(0, 50) + '…' : title
      ),
      description
        ? h(
            'div',
            {
              style: {
                marginTop: '20px',
                fontSize: '24px',
                color: '#6b7280',
                textAlign: 'center',
              },
            },
            description.length > 80 ? description.substring(0, 80) + '…' : description
          )
        : null,
      h(
        'div',
        {
          style: {
            position: 'absolute',
            bottom: '30px',
            right: '50px',
            fontSize: '20px',
            fontWeight: 600,
            color: '#0ea5e9',
          },
        },
        '趣味の記録'
      )
    )
  );

  // Generate SVG using satori
  const svg = await satori(element as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Noto Sans JP', data: fontRegular, weight: 400, style: 'normal' },
      { name: 'Noto Sans JP', data: fontBold, weight: 700, style: 'normal' },
    ],
  });

  // Convert SVG to PNG using sharp
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
