import type { Plugin } from 'vite';

/**
 * 公开静态页面路径列表（sitemap.xml 收录范围）。
 *
 * 数据来源：src/router/index.ts 中【无需登录鉴权、无动态参数、非重定向、非 404】的路由。
 * 注意：本列表为硬编码，与路由表不自动联动。
 * 新增公开路由后，请务必同步在此处补充对应 path，以保证 sitemap.xml 完整。
 */
export const SITEMAP_PATHS: string[] = [
  '/zh',
  '/zh/field',
  '/zh/field/detail',
  '/zh/rpm',
  '/zh/rpm/detail',
  '/zh/upstream',
  '/zh/search',
  '/zh/image',
  '/zh/image/detail',
  '/zh/oepkg',
  '/zh/oepkg/detail',
  '/zh/conda',
  '/zh/conda/detail',
  '/zh/pypi',
  '/zh/pypi/detail',
  '/zh/npm',
  '/zh/npm/detail',
  '/zh/source',
  '/zh/source/detail',
  '/zh/solution/opea',
  '/zh/solution/openhpc',
  '/zh/solution/openstack',
];

/**
 * 构建期生成 sitemap.xml 与 robots.txt 的 Vite 插件。
 *
 * 实现要点：
 * - 在 Rollup 的 `generateBundle` 钩子中通过 `this.emitFile` 以 asset 形式产出，
 *   自动写入 `build.outDir`（默认 dist）根目录，无需手动操作文件系统。
 * - 仅在构建（vite build）时触发；dev/serve 模式下不会产出任何文件。
 * - 站点域名由 .env.production 的 VITE_COOKIE_DOMAIN 拼接得到
 *   （如 https://easysoftware.openeuler.org）。
 *
 * @param siteUrl 站点根 URL（不含尾部斜杠），如 https://easysoftware.openeuler.org
 */
export function generateSitemapPlugin(siteUrl: string): Plugin {
  return {
    name: 'generate-sitemap',
    generateBundle() {
      // 拼接每个页面的完整 <loc>，path 已以 / 开头
      const urls = SITEMAP_PATHS.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n');

      // sitemap 协议参考：https://www.sitemaps.org/protocol.html
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

      // robots.txt：沿用原 public/robots.txt 规则，并追加 Sitemap 声明
      const robots = `User-agent:*\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;

      // fileName 即产物内相对路径，写入 dist 根目录
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}
