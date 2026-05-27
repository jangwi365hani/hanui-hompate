This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Keep Existing `/admin` and `/tangjeon` Working (Vercel)

If your schedule/admin system and tangjeon system are already running on other servers, keep them there and proxy only the paths from this Vercel app.

Set this environment variable in Vercel:

```bash
ADMIN_PROXY_ORIGIN=https://<existing-admin-server-origin>
TANGJEON_PROXY_ORIGIN=https://<existing-tangjeon-server-origin>
```

Then this app will forward:

- `/admin`
- `/admin/:path*`
- `/tangjeon`
- `/tangjeon/:path*`

to:

- `https://<existing-admin-server-origin>/admin`
- `https://<existing-admin-server-origin>/admin/:path*`
- `https://<existing-tangjeon-server-origin>/tangjeon`
- `https://<existing-tangjeon-server-origin>/tangjeon/:path*`

If `ADMIN_PROXY_ORIGIN` is not set, no `/admin` proxy rewrite is applied.
If `TANGJEON_PROXY_ORIGIN` is not set, no `/tangjeon` proxy rewrite is applied.

Important:
- Do not set these variables to `https://jangwi365.com` itself, or rewrite loops may happen.
- Use the real backend origin where each system is currently running.

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
