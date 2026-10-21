import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // avif першим: браузери з підтримкою отримують на ~20-30% легші фото, решта - webp
    formats: ["image/avif", "image/webp"],
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
