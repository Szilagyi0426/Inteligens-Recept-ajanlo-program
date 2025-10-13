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
};

export default withPWAPlugin(baseConfig);
