# Diagrflow W1–W2 技术可靠性阶段交付与验收报告（DG-01 ～ DG-07）

> [!NOTE]
> **执行基线**：`0e5162f455aa86b4eefbf44c8084ba29230aae13`（已从 `origin/main` 快进合并）。
> **当前测试与构建状态**：全套 **5 个测试文件 / 41 项测试全部通过**（`npm test`），TypeScript 编译与三路由静态预渲染构建通过（`npm run build`）。生产环境尚未触发部署，等待你审阅本报告与导出产物后授权发布。

---

## 一、五项审核调整落地对照表

| 调整项 | 实施细节与代码落点 |
|---|---|
| **1. 校验发生在数值修正之前** | 在 [`validatePrisma`](file:///Users/mac/diagrflow/src/lib/prisma.ts#L262-L545) 中，所有数值字段在进入 [`nonNeg`](file:///Users/mac/diagrflow/src/lib/prisma.ts#L186-L189) 截零/取整前直接对原始输入进行检查。[`PrismaForm`](file:///Users/mac/diagrflow/src/components/PrismaForm.tsx#L28-L35) 保留原始输入（清空必填项记为 `NaN` 显示为空，与显式输入的 `0` 严格区分；负数、小数原样保留在输入框中供用户修改并定位报错）。 |
| **2. 研究数不能自动视为报告数** | 当 `reportsOfIncludedStudies > 0` 且 `studiesIncludedOverride === null` 时，若未勾选 `confirmStudiesEqualReports`（[`PrismaForm.tsx`](file:///Users/mac/diagrflow/src/components/PrismaForm.tsx#L406-L418) 中的显式确认框），产生 `studiesIncluded-unconfirmed` 待确认项并阻止导出。同时修正了 [`cases.ts`](file:///Users/mac/diagrflow/src/lib/cases.ts) 中案例 1（`t2d-exercise`：PubMed 调为 `821`、Databases `1851`，流程剩余 `61` 份报告与 `reportsOfIncludedOverride: 61` 对齐，保留 `52` 项研究 vs `61` 份报告的一对多语义）和案例 3（`automation-screen`：PubMed 调为 `1692`、Databases `4112`，流程剩余 `118` 份报告与覆盖值 `118` 对齐，保留 `91` 项研究 vs `118` 份报告）。 |
| **3. 硬错误与待确认提示分开** | [`ValidationIssue`](file:///Users/mac/diagrflow/src/lib/prisma.ts#L84-L89) 区分 `severity: "error"`（负数、小数、必填清空、超额扣减、已启用细分合计不符、手动覆盖报告数与筛选流程剩余报告数不符、研究数大于报告数）与 `severity: "confirmation"`（研究数留空且未勾选确认等于报告数）。两者均阻止导出，绝不自动篡改数字来凑平。 |
| **4. 导出拦截覆盖实际调用路径** | [`assertValidForExport`](file:///Users/mac/diagrflow/src/lib/exportDiagram.ts#L31-L48) 直接内置于 [`downloadSvg`](file:///Users/mac/diagrflow/src/lib/exportDiagram.ts#L50-L68) 与 [`downloadPng`](file:///Users/mac/diagrflow/src/lib/exportDiagram.ts#L70-L128) 内部，并与 [`EditorPage`](file:///Users/mac/diagrflow/src/pages/EditorPage.tsx#L78-L96) 共享同一份 `validation` 结果。专项验证了“有效 → 改成无效 → 尝试导出被拒 → 修正后恢复导出”（见 [`prisma.test.ts`](file:///Users/mac/diagrflow/src/lib/prisma.test.ts#L288-L303) Scenario 10）。 |
| **5. 给预算留出余量** | 已在 [`.rankup/plan.md`](file:///Users/mac/diagrflow/.rankup/plan.md) 中将 W3 两篇教程（DG-08，2h）标记为条件/机动任务，保持总预算 18.25 小时不变。 |

---

## 二、DG-02 独立校验规则与 10 组独立测试场景

完整测试实现见 [`prisma.test.ts`](file:///Users/mac/diagrflow/src/lib/prisma.test.ts#L148-L304)：

| 场景编号 | 输入特征 | 预期行为与验收结果 |
|---|---|---|
| **Scenario 1** | 正常一对多（`t2d-exercise`：Databases 1851, Registers 48, 最终 61 份报告对应 52 项研究） | `canExport: true`，全部 Balance checks 为 `OK`（✅ 通过） |
| **Scenario 2** | **“10 减 20”超额扣减**（`databases=10, duplicatesRemoved=20`） | `recordsScreened = -10`，`identification` 平衡检查为 `false`，报 `identification-exceeded` 硬错误，`assertValidForExport` 抛错拦截导出（✅ 通过） |
| **Scenario 3** | **校验前原始负数与小数**（`databases=-5, registers=3.5`） | 未被 `nonNeg()` 掩盖，精准定位 `databases-negative` 与 `registers-decimal` 硬错误并阻止导出（✅ 通过） |
| **Scenario 4** | **必填项清空 vs 真实 0**（`databases=NaN` vs `databases=0`） | 清空状态报 `databases-empty` 必填错误并阻止导出；显式输入 `0` 正常通过（✅ 通过） |
| **Scenario 5** | **已启用数据库细分合计不符**（`databases=100`，子行 `40 + 50 = 90`） | 报 `databaseLines-mismatch` 硬错误，`databaseLines` 平衡检查为 `false`（✅ 通过） |
| **Scenario 6** | **已启用初筛人工/自动化细分合计不符**（`recordsExcluded=50`，细分 `30 + 10 = 40`） | 报 `recordsExcludedBreakdown-mismatch` 硬错误并阻止导出（✅ 通过） |
| **Scenario 7** | **Studies 留空未确认**（剩余报告 10，`studiesIncludedOverride=null`，未勾选确认） | 产生 `studiesIncluded-unconfirmed`（`severity: "confirmation"`）阻止导出；勾选 `confirmStudiesEqualReports: true` 后立即可导出（✅ 通过） |
| **Scenario 8** | **流程剩余报告数与手动覆盖报告数不符**（复现原“流程剩 52、手动填 61”） | 报 `reportsOfIncluded-mismatch` 硬错误，`includedReports` 检查为 `false`，阻止导出（✅ 通过） |
| **Scenario 9** | **Other methods 分支超额排除**（评估 3 份，排除理由填 6 份） | `otherReportsIncluded = -3`，报 `other-eligibility-exceeded` 硬错误并阻止导出（✅ 通过） |
| **Scenario 10** | **状态转换：有效 → 改无效 → 尝试导出 → 修正恢复** | 改为无效后立即拦截，修正回有效值后立即恢复导出（✅ 通过） |

---

## 三、DG-05 真实生成 12 份文件（6 组有效输入 × SVG/PNG）与视觉排障

在真实验收生成的 SVG/PNG 文件时，我们发现并修复了 **2 个真实图形渲染缺陷**：
1. **双栏模式顶部标题重叠**：原 [`PrismaDiagram.tsx`](file:///Users/mac/diagrflow/src/components/PrismaDiagram.tsx) 将左栏标题置于 `layout.width / 2`，开启右侧 `other-methods` 栏后与右栏标题重叠。现已改为分别在左栏双框中心与右栏双框中心对齐，彻底消除重叠。
2. **长文本溢出矩形框右边界**：原 [`layout.ts`](file:///Users/mac/diagrflow/src/lib/layout.ts) 的 `wrapBox` 未对框内单行文本换行，导致灰框说明（`Records marked as ineligible by automation tools (n = 420)`）及长排除理由超出右边框。现已按框宽自动折行并动态增加框高，下游连接线与阶段色带自动下移，无任何重叠或裁切。

### 6 组有效导出 PNG 视觉巡检（点击或滑动查看）

````carousel
![01-t2d-exercise](../exports/01-t2d-exercise.png)
<!-- slide -->
![02-citation-search](../exports/02-citation-search.png)
<!-- slide -->
![03-automation-screen](../exports/03-automation-screen.png)
<!-- slide -->
![04-rct-db-only](../exports/04-rct-db-only.png)
<!-- slide -->
![05-long-reasons-multi-db](../exports/05-long-reasons-multi-db.png)
<!-- slide -->
![06-large-counts-full-two-col](../exports/06-large-counts-full-two-col.png)
````

### 桌面端与小屏响应式核查截图

````carousel
![Desktop Editor Viewport](../exports/viewport-desktop-editor.png)
<!-- slide -->
![Mobile Editor Viewport](../exports/viewport-mobile-editor.png)
````

---

## 四、DG-03 预渲染复用、DG-04/06 事件闭环与回滚预案

1. **三路由预渲染（DG-03）**：
   - 复用了 PR #3 的 [`scripts/prerender.mjs`](file:///Users/mac/diagrflow/scripts/prerender.mjs)、[`src/entry-server.tsx`](file:///Users/mac/diagrflow/src/entry-server.tsx)、[`src/prerenderHtml.ts`](file:///Users/mac/diagrflow/src/prerenderHtml.ts)、[`src/seo.ts`](file:///Users/mac/diagrflow/src/seo.ts) 与 [`public/_redirects`](file:///Users/mac/diagrflow/public/_redirects)。
   - `npm run build` 生成 `dist/index.html`、`dist/pricing/index.html`、`dist/editor/index.html`，每个路由原始 HTML 均含独立 `<h1>`、正文段落、`<title>` 与 `canonical`，且 `?case=` 参数与客户端编辑导出均正常工作。
2. **最小产品漏斗与 5 次内部闭环（DG-04 & DG-06）**：
   - [`src/lib/analytics.ts`](file:///Users/mac/diagrflow/src/lib/analytics.ts) 实现了 `open / edit / sample / error / attempt / generated / failed` 七类事件，按 `sessionId` 去重，自动识别 `?internal=1` 内部标记与未修改纯样例（`isPureSample`），**零用户输入内容上传**，且严格将触发下载命名为 `generated`（绝不称为已保存或已投稿）。
   - 在 [`src/lib/analytics.test.ts`](file:///Users/mac/diagrflow/src/lib/analytics.test.ts) 中完成了 5 次内部端到端事件串联闭环测试，验证 `qualifiesAsValidExportSession === false`（100% 从业务统计中排除）。
3. **发布候选与回滚点（DG-06）**：
   - **当前回滚基线 Commit SHA**：`0e5162f455aa86b4eefbf44c8084ba29230aae13`（线上 Cloudflare Pages 当前生产部署）。
   - **回滚命令**：若发布后发现任何异常，可立即在 Cloudflare Pages 回滚至上一部署，或本地 `git checkout 0e5162f && npm run deploy`。
