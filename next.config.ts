// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  // se usa imagens remotas, configura domains aqui
  // images: { remotePatterns: [...] }
};

export default nextConfig;
