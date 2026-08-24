# 项目经验

- **[2026-08-24] 同账号 Cloudflare zone 不会自动给 Pages 写 CNAME；停车 A 记录会让自定义域一直报 CNAME record not set**

  Pages 自定义域 API 返回 200 且 `status=pending`，`verification_data.error_message` 为 `CNAME record not set`。当时 apex 仍是 Spaceship 停车 A（`54.149.79.189`、`34.216.117.25`）。Wrangler OAuth 只有 `zone:read`，DNS 列表 API 403。必须在 DNS 控制台删掉停车 A，再把 apex/www CNAME 指到 `*.pages.dev`（Proxied）。证据：同日 journal 14:35Z、releases.md 28277423。
