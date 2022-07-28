const withTM = require('next-transpile-modules')(['@awsui/components-react']);
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n
};

module.exports = withTM(nextConfig);
