const withTM = require('next-transpile-modules')(['@awsui/components-react']);
const { i18n } = require('./next-i18next.config');
const apps_menu = require('./scripts/apps_menu.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  env: {
    apps_menu: apps_menu.get('./src/pages/apps/')
  }
};

module.exports = withTM(nextConfig);
