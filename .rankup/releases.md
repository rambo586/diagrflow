# 发布记录

## 28277423 — 2026-08-24T14:22:00Z

- 环境：production
- 变更：首次把 Vite SPA 部署到 Cloudflare Pages；补 robots/sitemap/_headers/llms.txt；把 `diagrflow.com` 从 Spaceship 停车页切到 Pages
- 部署目标：Pages 项目 `diagrflow`（account `Bo5861142@gmail.com's Account` / `5e59e21a51e45920bc2cc2e0fa7c1f87`）；生产 `https://diagrflow.com`；别名 `https://diagrflow.pages.dev`；本次部署 `https://28277423.diagrflow.pages.dev`
- Git：工作树含未提交的 `.rankup/` 与 crawl 文件；`wrangler pages deploy --commit-hash` 指向当时 HEAD `0524d8c` 且 `--commit-dirty=true`
- 数据迁移：无
- 线上验证（2026-08-24）：
  - `https://diagrflow.com/` HTTP 200，`<title>Create a PRISMA 2020 flow diagram — Diagrflow</title>`，浏览器 H1 一致
  - `/editor` `/pricing` SPA fallback 200
  - `/editor?sample=1` 浏览器：26 个 input、Download SVG、screened 1278
  - `/robots.txt` `/sitemap.xml` `/llms.txt` 200
  - `/assets/index-4c4fdSis.js` `Cache-Control: public, max-age=31536000, immutable`
  - HTTP apex 现为 301 → HTTPS（不再是停车 HTML）
- 监控：尚未接 Web Analytics（阶段 7.5）
- 回滚点：把 apex CNAME 改回原停车 A 记录，或 `wrangler pages deployment` 回上一版本（此为首次发布，无上一应用版本）
- 证据：`wrangler pages deploy` 成功输出；Pages domains API `diagrflow.com` status=active；curl + OpenCLI 浏览器
- 结论：verified（apex）。www 公开解析待确认。
