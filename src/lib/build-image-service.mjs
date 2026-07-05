// ビルド時（Nodeプリレンダ環境）に実際の画像リサイズ・WebP変換を行うための
// sharpサービスのラッパー。
//
// @astrojs/cloudflare は imageService: 'compile' のとき、entrypoint文字列が
// 'astro/assets/services/sharp' そのものだと no-op の image-service-workerd に
// 強制的に差し替える（workerdでsharpが動かない前提の防御）。しかし本プロジェクトは
// prerenderEnvironment: 'node' でプリレンダするため sharp が問題なく動く。
// このファイルを経由して entrypoint 文字列を変えることで強制差し替えを回避し、
// widths 指定どおりに縮小された本物のWebPを生成させる。
//
// 注意: @astrojs/cloudflare 更新時はこの回避策が引き続き機能するか
// （srcset候補が実際に縮小されているか）を確認すること。
export { default } from 'astro/assets/services/sharp';
