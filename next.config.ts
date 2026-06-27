import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ubxvqqqqpjxukjkmnqgx.supabase.co/",   // Your Supabase project
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",   // This covers all Supabase domains
      },
    ],
  },
};

export default nextConfig;