import type { NextConfig } from "next";

const adminProxyOrigin = (process.env.ADMIN_PROXY_ORIGIN || "").replace(/\/+$/, "");
const tangjeonProxyOrigin = (process.env.TANGJEON_PROXY_ORIGIN || "").replace(/\/+$/, "");
const systemScheduleProxyOrigin = (
  process.env.SYSTEM_SCHEDULE_PROXY_ORIGIN ||
  process.env.ADMIN_PROXY_ORIGIN ||
  ""
).replace(/\/+$/, "");
const systemTangjeonProxyOrigin = (
  process.env.SYSTEM_TANGJEON_PROXY_ORIGIN ||
  process.env.TANGJEON_PROXY_ORIGIN ||
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
    const systemScheduleRewrites = systemScheduleProxyOrigin
      ? [
          { source: "/system/schedule", destination: `${systemScheduleProxyOrigin}/admin` },
          { source: "/system/schedule/:path*", destination: `${systemScheduleProxyOrigin}/admin/:path*` },
        ]
      : [
          { source: "/system/schedule", destination: "/admin" },
          { source: "/system/schedule/:path*", destination: "/admin/:path*" },
        ];
    const systemTangjeonRewrites = systemTangjeonProxyOrigin
      ? [
          { source: "/system/tangjeon", destination: `${systemTangjeonProxyOrigin}/tangjeon` },
          { source: "/system/tangjeon/:path*", destination: `${systemTangjeonProxyOrigin}/tangjeon/:path*` },
        ]
      : [];

    return {
      beforeFiles: [
        ...systemScheduleRewrites,
        ...systemTangjeonRewrites,
        ...adminRewrites,
        ...tangjeonRewrites,
        { source: "/reservation", destination: "/board.html" },
      ],
    };
  },
};

export default nextConfig;
