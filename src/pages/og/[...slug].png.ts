import { getCollection, type CollectionEntry } from 'astro:content';

export const prerender = true;

type Props = {
  post?: CollectionEntry<'blog'>;
};

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const paths = posts.map(post => ({
    params: { slug: post.id },
    props: { post } as Props,
  }));

  // 特別なページのパスも追加
  paths.push(
    { params: { slug: 'home' }, props: {} as Props },
    { params: { slug: 'about' }, props: {} as Props }
  );

  return paths;
}

export async function GET({ params, props }: { params: { slug: string }; props: Props }) {
  const { slug } = params;

  let title = '趣味の記録';
  let description = 'あきらきの趣味について記録しているブログです';
  let type = 'ブログ';
  let category = '';

  if (props.post) {
    // ブログ記事の場合
    title = props.post.data.title;
    description = props.post.data.description || '';
    category = props.post.data.category || '';
    type = 'ブログ記事';
  } else if (slug === 'home') {
    // ホームページ
    title = '趣味の記録';
    description = 'あきらきの趣味について記録しているブログです';
    type = 'ホーム';
  } else if (slug === 'about') {
    // プロフィールページ
    title = 'プロフィール | 趣味の記録';
    description = 'あきらき（kiakiraki）のプロフィール';
    type = 'プロフィール';
  }

  // PNG画像を生成（シンプルなSVG + sharp変換）
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Main content box -->
      <rect x="100" y="100" width="1000" height="430" rx="24" fill="rgba(255,255,255,0.95)" stroke="none"/>
      
      <!-- Type badge -->
      <rect x="150" y="150" width="${Math.max(type.length * 16 + 32, 80)}" height="40" rx="20" fill="#0ea5e9"/>
      <text x="${150 + Math.max(type.length * 16 + 32, 80) / 2}" y="175" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">${type}</text>
      
      <!-- Category badge (if exists) -->
      ${category ? `<rect x="${1050 - Math.max(category.length * 16 + 32, 80)}" y="150" width="${Math.max(category.length * 16 + 32, 80)}" height="40" rx="20" fill="#f3f4f6" stroke="#e5e7eb"/>
      <text x="${1050 - Math.max(category.length * 16 + 32, 80) / 2}" y="175" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="16" font-weight="500" fill="#374151" text-anchor="middle">${category}</text>` : ''}
      
      <!-- Title -->
      <text x="600" y="${title.length > 30 ? '280' : '300'}" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="${title.length > 30 ? '42' : '56'}" font-weight="800" fill="#1f2937" text-anchor="middle">${title.length > 50 ? title.substring(0, 50) + '...' : title}</text>
      
      <!-- Description -->
      ${description ? `<text x="600" y="${title.length > 30 ? '340' : '370'}" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">${description.length > 80 ? description.substring(0, 80) + '...' : description}</text>` : ''}
      
      <!-- Site name -->
      <text x="1050" y="510" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="20" font-weight="600" fill="#0ea5e9" text-anchor="end">趣味の記録</text>
    </svg>
  `;

  // SVGをPNGに変換
  const sharp = (await import('sharp')).default;
  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}