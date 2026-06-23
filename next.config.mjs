/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      // KyberSwap token list returns logos from various CDNs
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
