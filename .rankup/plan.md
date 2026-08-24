# 当前计划

- 目标：阶段 7.5 — 品牌资产、无 cookie 分析、IndexNow、站长工具
- 更新时间：2026-08-24T14:35:00Z

| 优先级 | 工作项 | 负责人 | 状态 | 验收标准 | 依赖 |
|---|---|---|---|---|---|
| P0 | 创建 Pages 项目 `diagrflow` 并部署 `dist/` | 主 agent | done | `https://diagrflow.pages.dev/` 与 `https://28277423.diagrflow.pages.dev` 返回 Diagrflow HTML；2026-08-24 上传 7 文件 | Wrangler OAuth |
| P0 | 绑定自定义域 `diagrflow.com` | 主 agent | done | 删掉停车页 A 记录 `54.149.79.189` / `34.216.117.25`；apex CNAME → `diagrflow.pages.dev`（Proxied）。HTTPS `/` `/editor` `/pricing` 200，无 `x-amz-version-id` | Pages 项目 |
| P0 | 线上验证三路由 + crawl 文件 | 主 agent | done | 2026-08-24 curl：`/` `/editor` `/pricing` `/robots.txt` `/sitemap.xml` `/llms.txt` 200；浏览器首页 H1 与 sample editor（26 inputs、Download SVG、screened 1278） | 自定义域生效 |
| P1 | 阶段 7.5 品牌资产 | 主 agent | pending | favicon.ico、192/512/maskable、apple-touch、manifest 全部线上 200；16px 可辨；`og:image` 存在 | P0 上线 |
| P1 | 阶段 7.5 测量 | 主 agent | pending | 至少一条分析 beacon 出现在**线上原始 HTML**（优先 Cloudflare Web Analytics）；IndexNow 密钥文件可达并完成一次推送；GSC/Bing 资源状态写入 integrations.md（已验证或写明卡在哪、需要用户点什么） | P0；用户账号用于 GSC/Bing |
| P2 | 关键词调研 | 主 agent | pending | `keywords.md` 三个种子词补齐阶段 1 的 6.1 六项证据并落 6.4 裁决；未测的量/KD 仍写 待确认，不编 | 关键词工具配额；最好等站点已是可抓取 origin |

## 阻塞项

- 无部署阻塞。
- `www.diagrflow.com`：Pages 域名 API 为 active；对权威 NS 的查询仍可能 NXDOMAIN（待传播或负缓存）。canonical 是 apex。
- 阶段 7.5 的 GSC / Bing 验证需要用户在已打开的站长工具里完成账号侧点击。
