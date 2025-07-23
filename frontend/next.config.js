/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Forward backend environment variables to frontend
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.replace("3001", "3005")
      : "http://localhost:3005",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
