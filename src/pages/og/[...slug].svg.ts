import { getCollection } from 'astro:content';

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const paths = posts.map(post => ({
    params: { slug: post.id },
    props: { post }
  }));

  // 特別なページのパスも追加
  paths.push(
    { params: { slug: 'home' }, props: null },
    { params: { slug: 'about' }, props: null }
  );

  return paths;
}

export async function GET({ params, props }: any) {
  const { slug } = params;
  
  let title = '趣味の記録';
  let description = 'あきらきの趣味について記録しているブログです';
  let type = 'ブログ';

  if (props?.post) {
    // ブログ記事の場合
    title = props.post.data.title;
    description = props.post.data.description || '';
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

  // シンプルなSVG画像を生成
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
      <rect x="150" y="150" width="${type.length * 20 + 32}" height="40" rx="20" fill="#0ea5e9"/>
      <text x="${150 + (type.length * 20 + 32) / 2}" y="175" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">${type}</text>
      
      <!-- Title -->
      <text x="600" y="280" font-family="Arial, sans-serif" font-size="${title.length > 20 ? '48' : '56'}" font-weight="800" fill="#1f2937" text-anchor="middle">${title.length > 40 ? title.substring(0, 40) + '...' : title}</text>
      
      <!-- Description -->
      ${description ? `<text x="600" y="350" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">${description.length > 60 ? description.substring(0, 60) + '...' : description}</text>` : ''}
      
      <!-- Site name -->
      <text x="1120" y="570" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="rgba(255,255,255,0.9)" text-anchor="end">趣味の記録</text>
    </svg>
  `;

  // SVGをPNGに変換するのではなく、SVGとして返す
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}