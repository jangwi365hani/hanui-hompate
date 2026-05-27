import type { NextConfig } from "next";

const adminProxyOrigin = (process.env.ADMIN_PROXY_ORIGIN || "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    const adminRewrites = adminProxyOrigin
      ? [
          { source: "/admin", destination: `${adminProxyOrigin}/admin` },
          { source: "/admin/:path*", destination: `${adminProxyOrigin}/admin/:path*` },
        ]
      : [];

    return {
      beforeFiles: [
        ...adminRewrites,
        { source: "/reservation", destination: "/board.html" },
      ],
    };
  },
};

export default nextConfig;
