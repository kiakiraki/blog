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

  // タイトルテキストの処理（長いタイトルは複数行に分割）
  const maxTitleLength = 30;
  let titleLines: string[] = [];
  
  if (title.length <= maxTitleLength) {
    titleLines = [title];
  } else {
    // 長いタイトルは適切な位置で改行
    const words = title.split('');
    let currentLine = '';
    
    for (const char of words) {
      if (currentLine.length + 1 <= maxTitleLength) {
        currentLine += char;
      } else {
        titleLines.push(currentLine);
        currentLine = char;
      }
    }
    if (currentLine) {
      titleLines.push(currentLine);
    }
    
    // 最大2行まで
    if (titleLines.length > 2) {
      titleLines = titleLines.slice(0, 2);
      titleLines[1] = titleLines[1].substring(0, maxTitleLength - 3) + '...';
    }
  }
  
  // タイトルのY位置を調整（行数に応じて）
  const titleStartY = titleLines.length === 1 ? 290 : 260;
  const lineHeight = 60;
  
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
      <rect x="150" y="150" width="${Math.max(type.length * 16 + 32, 80)}" height="40" rx="20" fill="#0ea5e9"/>
      <text x="${150 + Math.max(type.length * 16 + 32, 80) / 2}" y="175" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">${type}</text>
      
      <!-- Title (複数行対応) -->
      ${titleLines.map((line, index) => 
        `<text x="600" y="${titleStartY + (index * lineHeight)}" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="${titleLines.length === 1 ? '56' : '48'}" font-weight="800" fill="#1f2937" text-anchor="middle">${line}</text>`
      ).join('')}
      
      <!-- Description -->
      ${description ? `<text x="600" y="${titleStartY + (titleLines.length * lineHeight) + 30}" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">${description.length > 50 ? description.substring(0, 50) + '...' : description}</text>` : ''}
      
      <!-- Site name -->
      <text x="1120" y="570" font-family="'Hiragino Sans', 'Yu Gothic', Arial, sans-serif" font-size="20" font-weight="600" fill="rgba(255,255,255,0.9)" text-anchor="end">趣味の記録</text>
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