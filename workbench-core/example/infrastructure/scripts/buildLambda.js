#!/usr/bin/env node

const path = require('path');

require('esbuild')
  .build({
    entryPoints: [path.join(__dirname, '/../src/init.ts')],
    bundle: true,
    platform: 'node',
    target: 'node14',
    external: ['aws-sdk'],
    outfile: path.join(__dirname, '../build/buildLambda.js')
  })
  .catch(() => process.exit(1));
