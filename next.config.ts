import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // supabase storage - джерело фото портфоліо
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gpxbzpqnpbbumtiyfstc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // unsplash - стокові мініатюри у блоці відгуків
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
