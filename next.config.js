/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Handlebars
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader'
    });

    // Ignore OpenTelemetry warnings in development
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@opentelemetry/exporter-jaeger': false,
      };
    }

    return config;
  },
  // Disable OpenTelemetry in development
  experimental: {
    instrumentationHook: false
  }
};

module.exports = nextConfig; 