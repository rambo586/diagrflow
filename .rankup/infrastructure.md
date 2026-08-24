# 基础设施

观察日期：2026-08-24T14:35Z。Cloudflare 账户与 Pages 状态已用 Wrangler OAuth + 控制台核对。

## 域名

- 生产域：`diagrflow.com`
- Canonical：`https://diagrflow.com`
- Nameserver（已切到 Cloudflare）：`noel.ns.cloudflare.com` / `alina.ns.cloudflare.com`
- A 记录：Cloudflare 代理 IP
- TLS：证书存在（Google Trust Services WE1，签发 2026-08-24），覆盖 `diagrflow.com`
- Zone 状态：`active`（2026-08-24 CF API；zone id `c27533790b69e929fbbf85d160269613`；Free Website 计划）

## 当前源站（本应用）

此前（同日更早）：HTTPS HEAD 超时；HTTP 200 带 `x-amz-version-id`，HTML `<title>Parking Page</title>`。**该表述已作废。**

现在（2026-08-24T14:33Z curl + 浏览器）：

- 删除停车 A `54.149.79.189`、`34.216.117.25`
- apex CNAME → `diagrflow.pages.dev`（Proxied）
- www CNAME → `diagrflow.pages.dev`（Proxied；公开解析可能仍 NXDOMAIN）
- `https://diagrflow.com/` 200，title 为 Diagrflow
- HTTP apex 301 到 HTTPS

## Cloudflare Pages

| 项 | 状态 |
|---|---|
| Pages 项目名 | `diagrflow`（已创建） |
| 生产别名 | `https://diagrflow.pages.dev` |
| 本次部署 | `https://28277423.diagrflow.pages.dev` |
| Account | `5e59e21a51e45920bc2cc2e0fa7c1f87` |
| `*.workers.dev` | 不适用 |
| 构建产物目录 | `./dist` |
| SPA fallback | `public/_redirects`：`/* /index.html 200` |
| 自定义域 | `diagrflow.com` active；`www.diagrflow.com` Pages 侧 active |

## Wrangler

- Wrangler 4.125.0；2026-08-24 OAuth 登录 `bo5861142@gmail.com`
- 凭据：`~/Library/Preferences/.wrangler/config/default.toml`（不入库）
- 仓库配置：`wrangler.jsonc`
- 命令：`npm run deploy` / `npm run ship`

## 未使用的 Cloudflare 资源

不创建、不绑定：

- Workers SSR
- D1
- R2
- KV
- Queues / Workflows / Durable Objects

## Git

- origin：`https://github.com/rambo586/diagrflow.git`（公开）
- branch：`main`
- 对账 SHA：`0524d8c`（2026-08-24）
- GitHub Actions：无
- 提交（对账时）：initial；product (#1)；Cloudflare Pages SPA fallback `public/_redirects` (#2)
