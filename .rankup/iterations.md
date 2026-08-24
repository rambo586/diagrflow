# 迭代记录

## 迭代 0 — 初始化记忆与部署管线

- 时间：2026-08-24
- 假设：现有 Vite SPA 足以作为生产产物；缺的是 Pages 项目、自定义域、以及 crawl 文件 / wrangler 配置，而不是换框架
- 做了什么：建立 `.rankup/` wiki；加入 `wrangler.jsonc`、`public/robots.txt`、`public/sitemap.xml`、`public/_headers`、`public/llms.txt`；`package.json` 增加 `deploy` / `ship` 与 wrangler devDependency
- 没做什么：未 `wrangler login`、未部署、未提交 git（本迭代约束）
- 判据：仓库内 Pages 配置与三 URL sitemap 存在；测试与构建在加管线后仍能通过
- 结果：部署未执行。阻塞仍是 Wrangler 未认证 + 域上 origin 不是本应用。假设中「管线可写进仓库」部分待构建验证；「登录后即可上线」尚未检验
- 被证伪的假设：无（部署尚未尝试，不能把未跑的步骤当成失败）
- 下一轮唯一改进：认证 Wrangler，部署 Pages，把 `diagrflow.com` 绑到该项目，并在真实域验证 `/` `/editor` `/pricing`

## 迭代 1 — 首次生产部署

- 时间：2026-08-24
- 假设：zone 已在同一 Cloudflare 账号里，Pages 自定义域会自动写 CNAME。**被证伪**：域名 API 报 `CNAME record not set`；apex 仍是 Spaceship 停车 A 记录。必须在 DNS 控制台删 A、手写 CNAME。
- 做了什么：Wrangler OAuth 登录；`pages project create diagrflow`；`pages deploy dist`；API 添加自定义域；删除停车 A `54.149.79.189` / `34.216.117.25`；apex+www CNAME → `diagrflow.pages.dev`
- 判据：真实域 HTTPS 返回 Diagrflow HTML，浏览器能打开 sample editor
- 结果：apex 通过。www 公开解析未确认。
- 下一轮唯一改进：阶段 7.5 测量与品牌资产（不要再扩功能）
