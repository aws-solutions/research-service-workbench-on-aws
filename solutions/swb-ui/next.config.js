const withTM = require('next-transpile-modules')(['@awsui/components-react']);

const apps_menu = require('./scripts/apps_menu.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    apps_menu: apps_menu.get('./src/pages/apps/')
  }
};

module.exports = {
  ...withTM(nextConfig),
  trailingSlash: true
};