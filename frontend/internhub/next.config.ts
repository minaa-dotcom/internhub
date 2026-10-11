import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    appIsrStatus: false, // Hide the "N" button in development mode
  },
};

export default nextConfig;
