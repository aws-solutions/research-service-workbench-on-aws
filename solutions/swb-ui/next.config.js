const withTM = require('next-transpile-modules')(['@cloudscape-design/components']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

module.exports = {
  ...withTM(nextConfig),
  trailingSlash: true
};
