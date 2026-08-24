# 架构

观察日期：2026-08-24。以仓库源码为准，不是线上。

## 形态

客户端 SPA。没有服务端渲染、没有 API、没有鉴权、没有数据库。

- 框架：Vite 7 + React 19 + `react-router-dom` 7（`BrowserRouter`）
- 入口：`index.html` → `src/main.tsx` → `src/App.tsx`
- 包管理器：npm（不是 pnpm workspace / 不是 TanStack Start monorepo）
- 产物：`npm run build` → `dist/` 静态文件

不需要、也未配置 D1、R2、KV、Queues、Durable Objects 或 Workers SSR。静态 Cloudflare Pages 是当前正确的宿主。

## 路由

| 路径 | 页面 | 备注 |
|---|---|---|
| `/` | `HomePage` | `index.html` 已含 title / description / canonical / OG 文案 |
| `/editor` | `EditorPage` | title 与 canonical 仅在客户端 `useEffect` 写入 |
| `/editor?sample=1` | 同上，载入内置 sample | 不作为独立索引 URL |
| `/pricing` | `PricingPage` | 声明免费 MVP、无支付；title/canonical 仅 JS |
| `*` | 重定向到 `/` | `src/App.tsx` |

SPA fallback：`public/_redirects` 为 `/* /index.html 200`。

## 客户端模块

```text
src/
├── App.tsx                 布局：SiteHeader + Routes + SiteFooter
├── pages/
│   ├── HomePage.tsx
│   ├── EditorPage.tsx
│   └── PricingPage.tsx
├── components/
│   ├── PrismaDiagram.tsx   SVG 图
│   ├── PrismaForm.tsx      counts 表单
│   ├── SiteHeader.tsx
│   └── SiteFooter.tsx
└── lib/
    ├── prisma.ts           输入类型、派生 counts、平衡校验
    ├── layout.ts           盒子坐标
    ├── exportDiagram.ts    浏览器内 SVG/PNG 下载
    ├── sample.ts           内置示例
    ├── prisma.test.ts
    └── layout.test.ts
```

状态全部在 React 组件内。导出在浏览器里完成（`Blob` + `<a download>`），不上传到对象存储。

## 构建与测试

- 测试：`npm test` → `vitest run`（官方 box labels、count 算术、layout 数据）
- 构建：`npm run build` → `tsc --noEmit && vite build`
- 预览：`npm run preview`
- 部署脚本：`npm run deploy` / `npm run ship`（见 `package.json`；尚未在已认证 Wrangler 上执行）

Vite 默认把带 hash 的 JS/CSS 放到 `/assets/`。

## 明确不做的服务边界

| 能力 | 状态 |
|---|---|
| SSR HTML 按路由变化 | 无。爬虫拿到的是同一份 `index.html`，`/editor` 与 `/pricing` 的 title 依赖 JS |
| 用户账号 / session | 无 |
| 支付 webhook | 无（DEC-20260824-03） |
| 服务端保存图表 | 无 |
