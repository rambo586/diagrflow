# 基线

观察日期：2026-10-16（W1 DG-01 线上核查冻结）。实施代码基线：`0e5162f455aa86b4eefbf44c8084ba29230aae13`。

## 线上状态（2026-10-16 实测）

| 端点 | HTTP 状态 | 实际返回与核查结果 |
|---|---|---|
| `https://diagrflow.com/` | 200 | `<title>Create a PRISMA 2020 flow diagram — Diagrflow</title>`，包含 OG 元信息、`og.png` 及 JSON-LD（`WebSite` / `SoftwareApplication`），但原始 HTML 正文仍为空 `<div id="root"></div>`，无静态 `<h1>` |
| `https://diagrflow.com/editor` | 200 | SPA fallback 返回与首页相同的壳 HTML（空 `#root`，title 与 canonical 仍指向首页 `/`），依赖客户端 JS 修改 |
| `https://diagrflow.com/pricing` | 200 | SPA fallback 返回与首页相同的壳 HTML（空 `#root`，title 与 canonical 仍指向首页 `/`），依赖客户端 JS 修改 |
| `https://www.diagrflow.com/` | 200 | 已解析并返回与 apex 相同的应用 HTML，canonical 指向 `https://diagrflow.com/` |
| `https://diagrflow.com/robots.txt` | 200 | 返回 Cloudflare Managed content-signal 头部 + `User-agent: * / Allow: /` + `Sitemap: https://diagrflow.com/sitemap.xml` |
| `https://diagrflow.com/sitemap.xml` | 200 | 包含 `/`、`/editor`、`/pricing` 三个 URL（lastmod `2026-08-24`） |
| `https://diagrflow.com/llms.txt` | 200 | 正常返回站点与路由说明文本 |
| `https://diagrflow.com/og.png` | 200 | `image/png`（23,307 bytes）正常可访问 |
| `https://diagrflow.com/manifest.json` | 200 | `application/json`（393 bytes）正常可访问 |

- 线上生产静态资源构建产物为 `/assets/index-DrwznL3y.js` 与 `/assets/index-D_RdsgyZ.css`（对应 `c5b98d2` 之后的 SPA 构建，PR #3 预渲染尚未合并部署）。
- 线上 CSP 头部允许 `https://static.cloudflareinsights.com` 与 `https://cloudflareinsights.com`，但原始 HTML 中尚未注入 beacon 脚本，源码中也无产品级漏斗事件采集。

## 流量与搜索基线（同周期近 28 天）

| 指标 | 值 | 来源 / 口径说明 | 状态 |
|---|---|---|---|
| GSC 搜索相关非品牌点击 / 展示 / CTR | 未获得 | 需用户在 GSC 后台提供同周期近 28 天读数；旧 `ops/semrush-similarweb-2026-09-04.md` 仅追踪 2 个品牌词，不作非品牌获客基线 | 未获得（不代填 0） |
| Cloudflare 同周期独立访客 / 请求数 | 未获得 | 历史文档中提到的 `3.18k` 统计周期不明且无漏斗区分，不作为当前有效用户基线；需同周期 28 天读数 | 未获得（不代填 0） |
| 有效导出会话（非内部、非纯样例） | 未获得 | 当前线上无产品漏斗埋点，待 DG-04 接入后按会话去重统计 | 未获得（不代填 0） |
| 编辑到有效导出率 | 未获得 | 有效导出会话 / 至少一次有效人工编辑的非内部会话 | 未获得（不代填 0） |
| 真实任务独立完成率 | 未获得 | 目标观察 5 位不同参与者的首次任务（建议 ≥ 4/5 独立完成） | 未获得（待 W2/W3 开展） |

## 性能（Core Web Vitals）

| 页面 | LCP | CLS | INP | 性能分 | 来源 |
|---|---|---|---|---|---|
| `/` | 未获得 | 未获得 | 未获得 | 未获得 | 待预渲染合并上线后实测 |
| `/editor` | 未获得 | 未获得 | 未获得 | 未获得 | 待预渲染合并上线后实测 |
| `/pricing` | 未获得 | 未获得 | 未获得 | 未获得 | 待预渲染合并上线后实测 |

## 成本

- 托管：Cloudflare Pages 免费档。
- 域名：已指向 Cloudflare NS，apex 与 `www` 均正常响应 HTTPS 200。
