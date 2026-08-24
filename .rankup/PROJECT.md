# 项目定义

## 产品

- 名称：Diagrflow
- 一句话定位：focused web tool for journal-ready PRISMA 2020 flow diagrams for systematic reviews
- 目标用户：写系统评价 / 系统综述、需要在稿件中放入 PRISMA 2020 流程图的作者（期刊投稿场景）
- 核心问题：官方流程图结构固定、手画或通用绘图工具容易算错 counts、导出带水印或不符合期刊图注习惯
- 核心价值：按 identification / screening / eligibility / included 填 counts，图即时更新，导出无水印 SVG/PNG；作者可将导出图用于投稿，图注保留 PRISMA 2020 引用
- 商业模式：免费 MVP，无支付（PricingPage 与 README 写明）。付费档位 待确认，当前不做

## 目标

- 站点在 `https://diagrflow.com` 上线，`/`、`/editor`、`/pricing` 可被抓取
- 建立一条可重复的获客路径（SEO），而不是一次性投放
- 产品切片完整：打开编辑器 → 填 counts / 载入 sample → 导出 SVG 或 PNG

## 非目标

- 不是通用 graphical-abstract / 任意流程图套件
- 不与 prisma-statement.org 存在隶属关系
- 不把现有 Vite SPA 重脚手架成 TanStack Start
- 不为「以后可能需要」预建 D1 / R2 / KV / Workers SSR
- MVP 不接 Stripe、不做账号系统、不挂广告
- 不编造用户证言、搜索量或 KD

## 约束

- 技术：Vite + React 19 + react-router-dom SPA；构建 `tsc --noEmit && vite build`；测试 `npm test`（vitest）；包管理器 npm
- 业务：canonical 域 `https://diagrflow.com`；生产托管 Cloudflare Pages 静态 + `public/_redirects` SPA fallback
- 合规与安全：PRISMA 2020 模板为 CC BY 4.0；导出图图注需保留 Page et al., BMJ 2021;372:n71。仓库不得写入真实密钥。GitHub 仓库为公开（`https://github.com/rambo586/diagrflow.git`）

## 成功指标

| 指标 | 基线 | 目标 | 时间窗 | 数据源 |
|---|---:|---:|---|---|
| 生产域返回本应用 HTML | 2026-08-24：HTTPS HEAD 超时；HTTP 200 为停车页（`x-amz-version-id`） | `/` `/editor` `/pricing` 为 Diagrflow SPA | 阶段 7 完成时 | 真实域名 curl / 浏览器 |
| 可抓取 URL 集合 | 线上尚无本应用 sitemap | 三页出现在线上 `sitemap.xml` 且 200 | 部署后 | `https://diagrflow.com/sitemap.xml` |
| 自然搜索访问 | 无本应用流量 | 待确认（关键词未调研，不编数字） | 上线并被索引后 90 天 | GSC（尚未接入） |
| 回访 / 再次使用 | 无测量 | 待确认 | 同上 | CF Web Analytics / Clarity（尚未接入） |
| 收入 | 不适用 | 不适用（免费 MVP） | — | — |
