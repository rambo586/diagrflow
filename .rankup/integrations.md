# 平台接入

唯一看板。✅ = 已接且有证据和验证日期；⬜ = 待做；❌ = 不接，附裁决依据。

`rankup review` 必须线上实测，不采信本表勾选。本表初始化于 2026-08-24：生产域当时不服务本应用，因此凡依赖「线上 HTML grep」的项都不能标 ✅。

| 类别 | 平台 | 状态 | 证据 / 裁决 | 验证日期 |
|---|---|---|---|---|
| 托管方分析 | Cloudflare Web Analytics | ⬜ | 未接。beacon 未写入源码；线上不是本应用，无法 grep `cloudflareinsights` | 2026-08-24 |
| 产品分析 | GA4 | ⬜ | 未接。源码无 `gtag` / `googletagmanager` | 2026-08-24 |
| 行为分析 | Microsoft Clarity | ⬜ | 未接。源码无 `clarity.ms` | 2026-08-24 |
| 外链视角 | Ahrefs Site Explorer | ⬜ | 未建项目、未验证所有权 | 2026-08-24 |
| 外链视角 | Ahrefs Web Analytics | ⬜ | 未接。源码无 `analytics.ahrefs.com` | 2026-08-24 |
| 搜索平台 | Google Search Console | ⬜ | 未建资源、未 DNS/meta 验证、未提交 sitemap | 2026-08-24 |
| 搜索平台 | Bing Webmaster | ⬜ | 未建资源、未验证、未提交 sitemap | 2026-08-24 |
| 搜索平台 | Yandex Webmaster | ⬜ | 未接。源码无 `yandex-verification` | 2026-08-24 |
| 搜索平台 | Naver Search Advisor | ❌ | 非韩国市场站点：无 `/ko`、无 `.kr`、无韩文版。Naver 站长工具留到进入韩国市场再开。`robots.txt` 未单独拦截 Yeti | 2026-08-24 |
| 索引推送 | IndexNow | ⬜ | 无密钥文件、无推送记录。`ship` 尚未挂 IndexNow（站点未上线，密钥路由未建） | 2026-08-24 |
| 品牌资产 | favicon / manifest / icons | ⬜ | 仓库仅有 `public/favicon.svg`。缺 `favicon.ico`、`icon-192.png`、`icon-512.png`、`icon-maskable-512.png`、`apple-touch-icon.png`、`manifest.json`。`index.html` 无 `og:image` | 2026-08-24 |
| SEO 元素 | title / description / robots / OG | ⬜ | `index.html` 有首页 title、description、canonical、og:title/description/url/type、twitter:card。无 `og:image`。`/editor` `/pricing` 的 title/canonical 仅 JS。`robots.txt` 已写入仓库，线上尚未由本应用提供 | 2026-08-24 |
| 结构化数据 | JSON-LD（WebSite / Organization） | ⬜ | 源码无 `application/ld+json` | 2026-08-24 |
| AI 就绪度 | is-agentic | ⬜ | 未扫描。站点未在真实域上线，扫描停车页无意义 | 2026-08-24 |
| 多语言 | hreflang / `<html lang>` | ❌ | 单语言英文站（`index.html` `<html lang="en">`），无 locale 路由。hreflang 不适用，除非以后做 i18n | 2026-08-24 |
| 支付 | Stripe | ❌ | 免费 MVP。`PricingPage`：「There is no paid plan and no payment form on this site。」README：「Pricing: `/pricing` (free MVP; no payments)」。见 DEC-20260824-03 | 2026-08-24 |
| 广告 | AdSense | ❌ | 不是广告站；产品是投稿用工具，页上挂广告会伤害信任，也与「不编用户证言 / 干净导出」定位冲突 | 2026-08-24 |

## 资源 ID

尚无。接入后在此记录 **ID 而不是名字**（GSC property、Clarity project、GA4 measurementId、Ahrefs data-key、IndexNow 密钥路由）。
