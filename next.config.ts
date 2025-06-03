import type { NextConfig } from 'next';
import type { Configuration as WebpackConfiguration, RuleSetRule } from 'webpack'; // Added RuleSetRule for better typing

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // As per your existing config
  },
  eslint: {
    ignoreDuringBuilds: true, // As per your existing config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (
    config: WebpackConfiguration,
    { isServer }: { isServer: boolean; /* other options can be added here if needed */ }
  ) => {
    // Ensure module and rules arrays exist
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // Handle Handlebars
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
    } as RuleSetRule); // Added type assertion for clarity

    // Ignore OpenTelemetry warnings in development client-side bundles
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Spread existing fallbacks if any
        '@opentelemetry/exporter-jaeger': false,
      };
    }

    return config;
  },
  experimental: {
    // instrumentationHook: false, // From next.config.js - Commented out due to TS2353 in Next.js 15.2.3
    // If you have other experimental flags, they would go here.
    // For example, if next.config.ts had experimental: { appDir: true },
    // you would merge them: experimental: { instrumentationHook: false, appDir: true }
  },
};

export default nextConfig;
