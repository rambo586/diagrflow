# 平台接入

最后核对日期：2026-10-16（DG-01 核查更新）。✅ = 已接且有线上实测证据；⬜ = 待接入或待后台确认；❌ = 不接，附裁决依据。

| 类别 | 平台 | 状态 | 证据 / 裁决 | 验证日期 |
|---|---|---|---|---|
| 品牌资产 | favicon / manifest / icons / og.png | ✅ | 线上 `/favicon.svg`、`/favicon.ico`、`/apple-touch-icon.png`、`/manifest.json`、`/og.png`（1200×630）均返回 HTTP 200 | 2026-10-16 |
| SEO 元素 | title / description / robots / OG | ⬜ | 线上首页已有完整 OG/Twitter 标签，但 `/editor` 与 `/pricing` 原始 HTML 仍未预渲染独立 TDK 和正文 H1（待 DG-03 合并部署后复验） | 2026-10-16 |
| 结构化数据 | JSON-LD（WebSite / SoftwareApplication） | ✅ | 线上 `https://diagrflow.com/` 原始 HTML 已包含 `WebSite` 与 `SoftwareApplication` 两段 `application/ld+json` | 2026-10-16 |
| 安全头 | CSP / nosniff / frame / permissions | ✅ | 线上响应头已含 `content-security-policy`、`x-content-type-options: nosniff`、`x-frame-options: SAMEORIGIN`、`permissions-policy`、`referrer-policy` | 2026-10-16 |
| 托管方分析 | Cloudflare Web Analytics | ⬜ | 线上 CSP 已放行 `cloudflareinsights.com`，但原始 HTML 未见 beacon 注入；同周期 28 天读数待用户提供，且总访客不能替代产品导出漏斗 | 2026-10-16 |
| 产品漏斗分析 | 最小事件漏斗（`src/lib/analytics.ts`） | ⬜ | 待 DG-04 实现 `open / edit / sample / error / attempt / generated / failed`（按会话去重、排除内部与未修改样例、不上传用户输入内容），并对接用户确认的可用事件后台 | 2026-10-16 |
| 搜索平台 | Google Search Console | ⬜ | 近 28 天非品牌查询点击与展示读数未获得（待用户提供同周期数据或只读权限，缺失写“未获得”，不填 0） | 2026-10-16 |
| 搜索平台 | Bing Webmaster / IndexNow | ⬜ | 未接入，暂不阻塞 W1–W2 核心计数与导出可靠性主线 | 2026-10-16 |
| 多语言 | hreflang / `<html lang>` | ❌ | 单语言英文站（`<html lang="en">`），无多语言路由 | 2026-08-24 |
| 支付 | Stripe | ❌ | 免费 MVP，无真实付费证据前不接支付（见 `PricingPage` 与月度计划） | 2026-10-16 |
| 广告 | AdSense | ❌ | 投稿用学术流程图工具，不挂广告 | 2026-08-24 |
