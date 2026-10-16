# 审计

最近核对：2026-10-16（DG-01 线上与代码基线审计，基线提交 `0e5162f`）。

## 线上源站与基础可抓取性

| 问题 | 证据 | 严重度 | 状态 |
|---|---|---|---|
| `https://diagrflow.com` 源站与自定义域 | apex 与 `www.diagrflow.com` 均返回 HTTPS 200 | P0 | closed |
| `robots.txt` / `sitemap.xml` / `llms.txt` | 线上三文件均返回 HTTP 200，sitemap 含 `/` `/editor` `/pricing` | P0 | closed |
| `og:image`、图标集与 `manifest.json` | 线上 `index.html` 已含 `og:image`（`https://diagrflow.com/og.png` 200）、`favicon.ico`、`apple-touch-icon.png`、`manifest.json`（200） | P1 | closed（修正 8/24 过期记录） |
| 结构化数据 JSON-LD | 线上 `index.html` 已包含 `WebSite` 与 `SoftwareApplication` 两段 `application/ld+json` | P2 | closed（修正 8/24 过期记录） |
| 原始 HTML 空 `#root` 且子路由无静态独立 TDK | 2026-10-16 curl 实测：`/`、`/editor`、`/pricing` 原始 HTML 均为 `<div id="root"></div>`，无静态 `<h1>`；`/editor` 与 `/pricing` 的原始 `<title>` 和 `canonical` 仍为首页值。PR #3（`02a146b`）尚未合并 | P1 | open（DG-03 复用修复） |

## 业务逻辑与导出可靠性（P0 核心缺陷）

| 问题 | 证据 | 严重度 | 状态 |
|---|---|---|---|
| `balanceChecks` 循环自证，超额扣减仍显示 OK | `src/lib/prisma.ts` 中 `balanceChecks` 重复验证 `derivePrisma` 已恒成立的减法等式；输入 `databases=10, duplicatesRemoved=20` 时，`recordsScreened=-10` 但所有 Balance checks 均显示 `OK` | P0 | open（DG-02 修复） |
| `nonNeg()` 在校验前截零/取整掩盖错误 | `nonNeg()` 将负数变成 `0`、小数取整、`NaN` 变成 `0`；必填项清空也被转为 `0`，导致校验无法识别原始输入错误 | P0 | open（DG-02 修复） |
| 导出入口无有效性拦截 | `EditorPage.tsx` 的 `onExportSvg` / `onExportPng` 与 `exportDiagram.ts` 均未检查数据有效性，存在严重算术错误时仍可导出错误图片 | P0 | open（DG-02 修复） |
| 细分合计与总量未校验 | 启用 per-database lines、human vs automation 排除细分后，未校验细分之和是否等于对应框的总数；全文排除理由未校验是否超过 `reportsAssessed` | P0 | open（DG-02 修复） |
| Studies 与 Reports 默认混淆及案例 1 数据未对账 | `studiesIncludedOverride` 为空时默认自动等于报告数，缺少显式确认；`t2d-exercise` 案例流程剩余 52 份报告，但手动覆盖显示 61 份报告 | P1 | open（DG-02 修复） |

## 测量与分析

| 问题 | 证据 | 严重度 | 状态 |
|---|---|---|---|
| 缺少最小产品漏斗事件 | 线上与源码均无 `open / edit / sample / error / attempt / generated / failed` 漏斗记录，无法区分自然有效导出与内部测试或纯样例点击 | P1 | open（DG-04 修复） |
