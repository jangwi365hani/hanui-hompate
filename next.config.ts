import type { NextConfig } from "next";

// 장위스케줄 백엔드 (Railway 등 외부 호스팅) origin.
// SYSTEM_PROXY_ORIGIN을 우선하고, 과거 이름들도 fallback으로 받음.
const systemProxyOrigin = (
  process.env.SYSTEM_PROXY_ORIGIN ||
  process.env.SYSTEM_SCHEDULE_PROXY_ORIGIN ||
  process.env.ADMIN_PROXY_ORIGIN ||
  ""
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    const systemRewrites = systemProxyOrigin
      ? [
          { source: "/system", destination: `${systemProxyOrigin}/system` },
          { source: "/system/:path*", destination: `${systemProxyOrigin}/system/:path*` },
        ]
      : [];

    return {
      beforeFiles: [
        ...systemRewrites,
        { source: "/reservation", destination: "/board.html" },
      ],
    };
  },
  async redirects() {
    // 탕전시스템은 이제 장위스케줄에 통합되어 /system/tangjeon에서 서빙.
    return [
      { source: "/tangjeon", destination: "/system/tangjeon", permanent: false },
      { source: "/tangjeon/:path*", destination: "/system/tangjeon/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
