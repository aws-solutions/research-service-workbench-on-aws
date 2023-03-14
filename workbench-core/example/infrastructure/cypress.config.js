/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {},
  chromeWebSecurity: false // Required to allow switching origins from Cognito (HTTPS)) to localhost (HTTP)
});
