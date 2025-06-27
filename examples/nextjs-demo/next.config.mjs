/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these modules on the server
      config.externals.push('vectordb', '@lancedb/vectordb-darwin-arm64');
    }
    
    // Ignore markdown files
    config.module.rules.push({
      test: /\.md$/,
      loader: 'ignore-loader'
    });
    
    // Handle .node files
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader'
    });
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
};

export default nextConfig;