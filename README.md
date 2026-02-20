This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 辅助工具说明

### 1. 静态页面发布 (publish.js)
用于将生成的静态 HTML 文件一键发布到 dkfile.net 平台。
- **使用方法**: `node publish.js`
- **功能**: 自动读取 `index-export.html` 和 `red-packet-export.html`，并发布为不带后缀的页面（平台会自动补全 .html）。
- **注意**: 如果在受限网络环境下，脚本会自动尝试通过 `-k` 绕过 SSL 验证。

### 2. 凭据加密存储 (store_creds.js)
用于将第三方平台的账号密码加密后存储到 Supabase 数据库。
- **使用方法**: `node store_creds.js`
- **功能**: 对密码和 API Key 进行混淆加密后存入 `api.credentials` 表。
- **数据库表**: 对应的 SQL 迁移文件位于 `supabase/migrations/20260212_create_credentials.sql`。

## 部署说明
...
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
