import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    if (process.env.NODE_ENV !== "production") return [];

    const cloudEnabled = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    const paths = ["/demo/:path*"];
    if (!cloudEnabled) paths.push("/login", "/mypage");

    return paths.map(source => ({
      source,
      destination: "/kwjw1012-eng",
      permanent: false,
    }));
  },
};

export default nextConfig;
