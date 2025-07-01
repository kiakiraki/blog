<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          
          .header {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            text-align: center;
          }
          
          .header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2.5rem;
            font-weight: 700;
          }
          
          .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 1.1rem;
          }
          
          .info-box {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .info-box h2 {
            margin-top: 0;
            color: #0ea5e9;
            font-size: 1.5rem;
          }
          
          .copy-url {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 0.75rem;
            border-radius: 6px;
            font-family: monospace;
            word-break: break-all;
            margin: 1rem 0;
          }
          
          .item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: box-shadow 0.2s ease;
          }
          
          .item:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .item h3 {
            margin-top: 0;
            margin-bottom: 0.5rem;
          }
          
          .item h3 a {
            color: #1f2937;
            text-decoration: none;
            font-weight: 600;
          }
          
          .item h3 a:hover {
            color: #0ea5e9;
          }
          
          .item-meta {
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 0.75rem;
          }
          
          .item-description {
            color: #4b5563;
            line-height: 1.6;
          }
          
          .footer {
            text-align: center;
            padding: 2rem 0;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            margin-top: 2rem;
          }
          
          @media (max-width: 640px) {
            body {
              padding: 1rem;
            }
            
            .header {
              padding: 1.5rem;
            }
            
            .header h1 {
              font-size: 2rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p><xsl:value-of select="/rss/channel/description"/></p>
        </div>
        
        <div class="info-box">
          <h2>📡 RSS フィード</h2>
          <p>このページはRSSフィードです。RSSリーダーやフィードリーダーで購読することで、新しい記事の更新通知を受け取ることができます。</p>
          
          <p><strong>フィードURL:</strong></p>
          <div class="copy-url"><xsl:value-of select="/rss/channel/link"/>rss.xml</div>
          
          <p><strong>使い方:</strong></p>
          <ul>
            <li>上記URLをコピーして、お使いのRSSリーダーに追加してください</li>
            <li>新しい記事が公開されると自動的に通知されます</li>
            <li>Feedly、Inoreader、NetNewsWireなどのRSSリーダーでご利用いただけます</li>
          </ul>
        </div>
        
        <h2>最新の記事</h2>
        
        <xsl:for-each select="/rss/channel/item">
          <div class="item">
            <h3><a href="{link}" target="_blank"><xsl:value-of select="title"/></a></h3>
            <div class="item-meta">
              公開日: <xsl:value-of select="substring(pubDate, 1, 16)"/>
            </div>
            <div class="item-description">
              <xsl:value-of select="description"/>
            </div>
          </div>
        </xsl:for-each>
        
        <div class="footer">
          <p>最終更新: <xsl:value-of select="substring(/rss/channel/lastBuildDate, 1, 16)"/></p>
          <p>Generated by <xsl:value-of select="/rss/channel/generator"/></p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>