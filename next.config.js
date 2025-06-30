/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './app',
    };
    config.module.rules.push({
      test: /\.html$/,
      loader: 'html-loader'
    });
    return config;
  },
};

module.exports = nextConfig; 