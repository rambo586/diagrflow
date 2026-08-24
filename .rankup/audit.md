# 审计

最近核对：2026-08-24。线上检查的是当时的真实域，不是本地 `dist/`。

## 线上源站（P0）

| 问题 | 证据 | 严重度 | 状态 |
|---|---|---|---|
| `https://diagrflow.com` 不是 Diagrflow | 2026-08-24 早些时候 HTTPS 超时、HTTP 停车页。**同日 14:33Z 起作废**：apex HTTPS 200，title 为 Diagrflow | P0 | closed 2026-08-24 |
| Pages 项目不存在 | 已创建 `diagrflow`，部署 `28277423` | P0 | closed 2026-08-24 |
| 自定义域未绑到本应用 | apex CNAME → `diagrflow.pages.dev`，Pages domain active | P0 | closed 2026-08-24 |

## 可抓取性

| 问题 | 证据 | 严重度 | 状态 |
|---|---|---|---|
| 线上无本应用 `robots.txt` / `sitemap.xml` | 2026-08-24 14:33Z：`https://diagrflow.com/robots.txt` 与 `/sitemap.xml` 均为 200，sitemap 含 `/` `/editor` `/pricing` | P0 | closed 2026-08-24 |
| SPA 路由 title 仅 JS | `EditorPage` / `PricingPage` 在 `useEffect` 里改 `document.title` 与 canonical。无 JS 的抓取器对 `/editor` `/pricing` 看到的是首页 `index.html` title | P1 | open（受 DEC-20260824-01 约束，不因此重写框架） |
| 无 `og:image` | `index.html` 有 og:title/description/url/type，无 `og:image` / `twitter:image` | P1 | open |
| 图标集不完整 | 仅 `public/favicon.svg`。无 ico / 192 / 512 / maskable / apple-touch / `manifest.json` | P1 | open |
| 无 JSON-LD | 源码无 `application/ld+json` | P2 | open |

## 阶段 7.5 闸门（0–6）预检

对象已是本应用（apex）。闸门 0–6 仍未过，因为缺图标集、og:image、分析 beacon、IndexNow 与站长工具。

| # | 检查项 | 状态 |
|---|---|---|
| 0 | 站点身份（OG 图 ≥1200px、图标全集、manifest 引用命中） | 未过。缺 og:image 与图标集 |
| 1 | 技术 SEO（线上 sitemap 与真实 URL 一致、robots、llms.txt） | 仓库已写 sitemap/robots/llms.txt；线上未由本应用提供 |
| 2 | TDK 全站逐 URL | 未过。`/editor` `/pricing` 无静态独立 TDK |
| 3 | 关键词密度 | 未做。目标短语仍是 RESEARCH，没有声明可测的本页短语 |
| 4 | is-agentic | 未扫。扫停车页无意义 |
| 5 | 哥飞 AI 审阅 | 未做。目标必须是真实线上本应用 |
| 6 | 性能 / CWV | 未测 |

## 复验

上线后用真实域重跑本表：请求 `/` `/editor` `/pricing` `/robots.txt` `/sitemap.xml` `/llms.txt` `/favicon.svg`，核对 HTML 是否为 Diagrflow 而不是停车页。
