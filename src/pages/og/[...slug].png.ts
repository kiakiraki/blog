import { getCollection } from 'astro:content';
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '@/consts';

// フォントデータをフェッチする関数
async function getFontData(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font: ${response.statusText}`);
  }
  return response.arrayBuffer();
}

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  // フォントのフェッチを並行して実行
  const [notoSerifJpRegular, notoSerifJpBold] = await Promise.all([
    getFontData(
      'https://fonts.gstatic.com/s/notosansjp/v61/-F62fjtqLzI2JPCgQBnw7HFyzsdmKu3B32zE61s.woff'
    ),
    getFontData(
      'https://fonts.gstatic.com/s/notosansjp/v61/-F6pfjtqLzI2JPCgQBnw7HFy2sZg-2_B32zE61s.woff'
    ),
  ]);

  let title = SITE_TITLE;
  let description = SITE_DESCRIPTION;

  if (slug && slug !== 'home' && slug !== 'about') {
    const posts = await getCollection('blog');
    const post = posts.find(p => p.slug === slug.replace(/\.png$/, ''));
    if (post) {
      title = post.data.title;
      description = post.data.description || SITE_DESCRIPTION;
    }
  } else if (slug === 'about') {
    title = 'プロフィール';
    description = 'あきらき（kiakiraki）のプロフィール';
  }

  // @vercel/ogを使って画像を生成
  const html = {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        backgroundImage: 'linear-gradient(to bottom right, #0ea5e9 0%, #0284c7 100%)',
        padding: '60px',
        fontFamily: '"Noto Sans JP"',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '24px',
              padding: '50px 60px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  },
                  children: [
                    {
                      type: 'h1',
                      props: {
                        style: {
                          fontSize: '56px',
                          fontWeight: 700,
                          color: '#1f2937',
                          lineHeight: 1.3,
                          maxHeight: '230px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                        children: title,
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          fontSize: '28px',
                          color: '#4b5563',
                          lineHeight: 1.5,
                          maxHeight: '125px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                        children: description,
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    alignSelf: 'flex-end',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#0ea5e9',
                  },
                  children: SITE_TITLE,
                },
              },
            ],
          },
        },
      ],
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Noto Sans JP',
        data: notoSerifJpRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Noto Sans JP',
        data: notoSerifJpBold,
        weight: 700,
        style: 'normal',
      },
    ],
  });
};

// On-demand rendering: getStaticPaths is not needed for server-side rendering.
// By removing it, Astro will treat this as a dynamic route.
