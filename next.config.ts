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
        // 탕전시스템은 public/tangjeon 정적 파일을 Vercel이 직접 서빙.
        // /tangjeon (트레일링 슬래시 없는 경우)도 index.html을 보여주도록 매핑.
        { source: "/tangjeon", destination: "/tangjeon/index.html" },
        { source: "/reservation", destination: "/board.html" },
      ],
    };
  },
  async redirects() {
    // 기존 /admin 북마크 호환: /admin/* → /system/*
    return [
      { source: "/admin", destination: "/system", permanent: true },
      { source: "/admin/:path*", destination: "/system/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
