import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
  // @ts-ignore - allowedDevOrigins is valid for next.js dev server cross-origin HMR
  allowedDevOrigins: ["192.168.1.3", "localhost", "127.0.0.1"],
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

export default nextConfig;
