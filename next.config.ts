import type { NextConfig } from "next";

const adminProxyOrigin = (process.env.ADMIN_PROXY_ORIGIN || "").replace(/\/+$/, "");
const tangjeonProxyOrigin = (
  process.env.SYSTEM_TANGJEON_PROXY_ORIGIN ||
  process.env.TANGJEON_PROXY_ORIGIN ||
  ""
).replace(/\/+$/, "");
const systemProxyOrigin = (
  process.env.SYSTEM_PROXY_ORIGIN ||
  process.env.SYSTEM_SCHEDULE_PROXY_ORIGIN ||
  process.env.ADMIN_PROXY_ORIGIN ||
  ""
).replace(/\/+$/, "");

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
    const systemRewrites = systemProxyOrigin
      ? [
          { source: "/system", destination: `${systemProxyOrigin}/admin` },
          { source: "/system/:path*", destination: `${systemProxyOrigin}/admin/:path*` },
        ]
      : [
          { source: "/system", destination: "/admin" },
          { source: "/system/:path*", destination: "/admin/:path*" },
        ];

    return {
      beforeFiles: [
        ...systemRewrites,
        ...adminRewrites,
        ...tangjeonRewrites,
        { source: "/reservation", destination: "/board.html" },
      ],
    };
  },
};

export default nextConfig;
