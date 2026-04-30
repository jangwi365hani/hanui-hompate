import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/reservation", destination: "/board.html" },
      ],
    };
  },
};

export default nextConfig;
