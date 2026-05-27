import type { NextConfig } from "next";

const adminProxyOrigin = (process.env.ADMIN_PROXY_ORIGIN || "").replace(/\/+$/, "");
const tangjeonProxyOrigin = (process.env.TANGJEON_PROXY_ORIGIN || "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    const adminRewrites = adminProxyOrigin
      ? [
          { source: "/admin", destination: `${adminProxyOrigin}/admin` },
          { source: "/admin/:path*", destination: `${adminProxyOrigin}/admin/:path*` },
        ]
      : [];
    const tangjeonRewrites = tangjeonProxyOrigin
      ? [
          { source: "/tangjeon", destination: `${tangjeonProxyOrigin}/tangjeon` },
          { source: "/tangjeon/:path*", destination: `${tangjeonProxyOrigin}/tangjeon/:path*` },
        ]
      : [];

    return {
      beforeFiles: [
        ...adminRewrites,
        ...tangjeonRewrites,
        { source: "/reservation", destination: "/board.html" },
      ],
    };
  },
};

export default nextConfig;
