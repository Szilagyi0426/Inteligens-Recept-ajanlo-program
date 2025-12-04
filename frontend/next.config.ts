import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const withPWAPlugin = withPWA({
  dest: "public",
  disable: !isProd,
});

const baseConfig: NextConfig = {
  reactStrictMode: true, 
  typedRoutes: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
      },
    ],
  },
};

export default withPWAPlugin(baseConfig);
