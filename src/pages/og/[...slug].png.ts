import { ImageResponse } from '@vercel/og';
import { getCollection } from 'astro:content';

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const paths = posts.map(post => ({
    params: { slug: post.id },
    props: { post }
  }));
  
  // ホームページとプロフィールページのOGP画像も生成
  paths.push(
    { params: { slug: 'home' }, props: { post: null } },
    { params: { slug: 'about' }, props: { post: null } }
  );
  
  return paths;
}

export async function GET({ props, params }: any) {
  const { post } = props;
  const { slug } = params;
  
  // ページタイプに応じて内容を設定
  let title = '';
  let description = '';
  let type = '';
  
  if (post) {
    // ブログ記事
    title = post.data.title;
    description = post.data.description || '';
    type = 'ブログ記事';
  } else if (slug === 'home') {
    // ホームページ
    title = '趣味の記録';
    description = '趣味や日常の記録を気ままに綴るブログです';
    type = 'ホーム';
  } else if (slug === 'about') {
    // プロフィールページ
    title = 'プロフィール';
    description = 'あきらき（kiakiraki）のプロフィール';
    type = 'プロフィール';
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* メインコンテンツ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '60px',
            margin: '40px',
            maxWidth: '900px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* タイプラベル */}
          <div
            style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              fontSize: '20px',
              fontWeight: '600',
              padding: '8px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            {type}
          </div>
          
          {/* タイトル */}
          <h1
            style={{
              fontSize: title.length > 30 ? '48px' : '64px',
              fontWeight: '800',
              color: '#1f2937',
              textAlign: 'center',
              lineHeight: '1.1',
              margin: '0 0 20px 0',
              maxWidth: '800px',
            }}
          >
            {title}
          </h1>
          
          {/* 説明文 */}
          {description && (
            <p
              style={{
                fontSize: '24px',
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: '1.4',
                margin: '0',
                maxWidth: '700px',
              }}
            >
              {description.length > 100 ? description.substring(0, 100) + '...' : description}
            </p>
          )}
        </div>
        
        {/* フッター */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '20px',
            fontWeight: '600',
          }}
        >
          趣味の記録
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}