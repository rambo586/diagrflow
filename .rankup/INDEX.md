# Rankup 项目索引

- 项目：Diagrflow
- 最近更新：2026-08-24T14:35:00Z
- 当前阶段：7.5（品牌资产与测量接入）
- 上一个完成的关卡：阶段 7 — Cloudflare Pages 项目 `diagrflow` 已部署，`https://diagrflow.com` 返回本应用（2026-08-24；部署 `https://28277423.diagrflow.pages.dev`）
- 下一步动作：阶段 7.5 — 补完整图标集与 `og:image`、接 Cloudflare Web Analytics、IndexNow 焊进 `ship`、注册 GSC/Bing
- 当前阻塞：无部署阻塞。`www.diagrflow.com` 公开解析可能仍 NXDOMAIN。GSC/Bing 需要用户账号侧点击。

## 推荐读取顺序

1. PROJECT.md
2. infrastructure.md
3. plan.md
4. decisions.md
5. audit.md

## 文件状态

| 文件 | 内容 | 最近核对 | 状态 |
|---|---|---|---|
| PROJECT.md | 产品目标与边界 | 2026-08-24 | current |
| architecture.md | Vite SPA、无 D1/R2/KV | 2026-08-24 | current |
| infrastructure.md | Pages 已建、apex 已切到本应用 | 2026-08-24 | current |
| integrations.md | 平台接入看板 | 2026-08-24 | current |
| secrets.md | 密钥元数据（空表） | 2026-08-24 | current |
| baseline.md | 无本应用线上流量 | 2026-08-24 | current |
| keywords.md | 三个种子词，状态 RESEARCH | 2026-08-24 | current |
| decisions.md | DEC-20260824-01..04 | 2026-08-24 | current |
| audit.md | P0 源站已关；7.5 闸门未过 | 2026-08-24 | current |
| plan.md | P0 部署已完成；P1 为 7.5 | 2026-08-24 | current |
| roadmap.md | 「1」= 上线 + 可重复 SEO 获客 | 2026-08-24 | current |
| iterations.md | 迭代 0–1 | 2026-08-24 | current |
| experiments.md | 空 | 2026-08-24 | current |
| releases.md | 28277423 已验证（apex） | 2026-08-24 | current |
| experience.md | 空 | 2026-08-24 | current |
| journal/2026-08-24.md | 对账事实 | 2026-08-24 | current |

## 项目脚本

尚无 `.rankup/scripts/`。`npm run deploy` / `npm run ship` 已在 2026-08-24 跑通（Pages 部署 `28277423`）。

## 最近变化

- 2026-08-24 14:20Z：初始化 `.rankup/` wiki；补 crawl 文件与 wrangler 配置。
- 2026-08-24 14:35Z：Pages 首次部署；`diagrflow.com` 切到本应用。下一阶段 7.5。
