# 决策记录

## DEC-20260824-01：保留现有 Vite SPA，不重初始化 TanStack Start

- 状态：accepted
- 日期：2026-08-24
- 背景：Rankup 默认新站脚手架是 TanStack Start monorepo。本仓库已经是 Vite + React 19 + react-router-dom SPA，产品 MVP 与测试/构建已存在。
- 备选方案：1) 就地继续 SPA；2) 按 Rankup 默认重脚手架到 TanStack Start + Workers SSR。选项 2 会覆盖已有产品并违反「已有项目不得因缺 `.rankup/` 而重建技术栈」。
- 决定：保持现有 Vite SPA。不 `shadcn init --template start`，不迁 SSR。
- 证据：`package.json` 依赖 `react` / `react-dom` / `react-router-dom`；`src/main.tsx` 使用 `BrowserRouter`；`src/App.tsx` 三个路由；无 `@cloudflare/vite-plugin`、无 D1。
- 影响：爬虫拿到的 HTML 壳对 `/editor` `/pricing` 不带独立 title（见 `audit.md`）。收益是零迁移成本、现有 vitest 继续有效。
- 复查条件：若出现必须 SSR 才能过的索引/社交预览门禁（例如搜索结果持续展示首页 title、或需要服务端按路由输出 JSON-LD），重新评估 prerender 或有限 SSR。不得仅因 Rankup 默认栈而重写。
- 关联：architecture.md、journal/2026-08-24.md

## DEC-20260824-02：宿主为 Cloudflare Pages 静态站，不是 Workers SSR

- 状态：accepted
- 日期：2026-08-24
- 背景：阶段 4 默认 Workers + D1 + R2。本应用无服务端状态、无上传、无 API。`public/_redirects` 已写成 Pages SPA fallback。
- 备选方案：1) Pages 静态 + `_redirects`；2) Worker 做 SSR；3) Pages + Functions。选项 2/3 没有对应的数据或鉴权需求。
- 决定：Cloudflare Pages，构建输出 `dist/`。`wrangler.jsonc` 使用 `pages_build_output_dir: "./dist"`。
- 证据：`public/_redirects` 为 `/* /index.html 200`；无 `wrangler.toml` Worker 入口（2026-08-24 前）；无 bindings。
- 影响：部署依赖 Pages 项目 + 自定义域。不创建 D1/R2/KV。
- 复查条件：若产品需要服务端保存图表、账号或支付 webhook，再考虑 Worker。免费 MVP 范围内不复查为了「完整性」而加 bindings。
- 关联：infrastructure.md、plan.md

## DEC-20260824-03：MVP 不接支付

- 状态：accepted
- 日期：2026-08-24
- 背景：阶段 6 默认可接 Stripe。定价页与 README 已明确免费、无支付表单。
- 备选方案：1) 现在接 Stripe 占位价格；2) 保持免费直到有付费证据。选项 1 与已上线文案冲突，且没有价格实验。
- 决定：不安装 Stripe、不建 Checkout、不配 webhook。`integrations.md` 支付标 ❌。
- 证据：`src/pages/PricingPage.tsx`（「Free while this is an MVP」「no Stripe checkout」）；README「free MVP; no payments」。
- 影响：路线图的「1」不能定义成收入。成功看上线 + 可重复获客 + 回访，而不是第一笔美金。
- 复查条件：PricingPage 文案改为付费、或有未打折的自然付费需求证据时重开。在那之前 `rankup review` 不得把 Stripe 标回 ⬜ 催办。
- 关联：PROJECT.md、roadmap.md、integrations.md

## DEC-20260824-04：生产域为 diagrflow.com

- 状态：accepted
- 日期：2026-08-24
- 背景：品牌与 canonical 已写进 `index.html`、README、页脚。
- 备选方案：先用 `*.pages.dev` 作为长期生产域；或另购域名。品牌资产与 OG url 已经指向 `https://diagrflow.com`。
- 决定：唯一生产域 `diagrflow.com`（canonical `https://diagrflow.com`）。Pages 默认域只作部署过程中的预览，不作为对外品牌。
- 证据：`index.html` canonical / `og:url`；`SiteFooter` 文案；README Domain 行。NS 已是 `noel` / `alina`（2026-08-24）。
- 影响：阶段 7 验收对象是该域，不是 pages.dev。域名目前仍指向非本应用 origin，部署后必须把自定义域绑到 Pages。
- 复查条件：若放弃该品牌名或迁到别的域，必须同步 `index.html` canonical/OG、sitemap、robots、llms.txt、本文件与 `infrastructure.md`。
- 关联：infrastructure.md、audit.md
