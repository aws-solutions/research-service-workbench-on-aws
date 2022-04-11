#!/usr/bin/env node

path = require('path');

require('esbuild')
  .build({
    entryPoints: [path.join(__dirname, '/../src/backendAPILambda.ts')],
    bundle: true,
    platform: 'node',
    target: 'node14',
    external: ['aws-sdk'],
    outfile: path.join(__dirname, '../build/backendAPI/backendAPILambda.js')
  })
  .catch(() => process.exit(1));

// Status handler
require('esbuild')
  .build({
    entryPoints: [path.join(__dirname, '/../src/environment/statusHandlerLambda.ts')],
    bundle: true,
    platform: 'node',
    target: 'node14',
    external: ['aws-sdk'],
    outfile: path.join(__dirname, '../build/statusHandler/statusHandlerLambda.js')
  })
  .catch(() => process.exit(1));

// Account handler
require('esbuild')
  .build({
    entryPoints: [path.join(__dirname, '/../src/accountHandlerLambda.ts')],
    bundle: true,
    platform: 'node',
    target: 'node14',
    external: ['aws-sdk'],
    outfile: path.join(__dirname, '../build/accountHandler/accountHandlerLambda.js')
  })
  .catch(() => process.exit(1));
