const withTM = require('next-transpile-modules')(['@awsui/components-react']);
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  env: {
    API_BASE_URL: '' //"https://lambda.region.amazonaws.com/dev/",
  }
};

module.exports = withTM(nextConfig);
