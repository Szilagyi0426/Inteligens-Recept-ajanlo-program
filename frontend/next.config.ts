import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

// PWA plugin konfigurálása
const withPWAPlugin = withPWA({
  dest: "public",
  disable: !isProd, // PWA csak éles környezetben legyen engedélyezve
});

const baseConfig: NextConfig = { // Alap Next.js konfiguráció
  reactStrictMode: true, // React szigorú mód engedélyezése
  experimental: { // Kísérleti funkciók engedélyezése
    typedRoutes: true,
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
