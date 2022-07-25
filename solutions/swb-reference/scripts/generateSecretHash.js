#!/usr/bin/env node
// To use the script, follow the example below
// STAGE=<STAGE> generateSecretHash.js <userName> '<password>'

const crypto = require('crypto');
const { join } = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

console.log('args', process.argv);

const config = yaml.load(
  // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
  // correct file
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFileSync(join(__dirname, `../src/config/${process.env.STAGE}.yaml`), 'utf8') // nosemgrep
);

const clientSecret = config.clientSecret;
const clientId = config.clientId;
const userPoolId = config.userPoolId;
const region = config.awsRegion;
const username = process.argv[2];
const password = process.argv[3];

const secretHash = crypto
  .createHmac('SHA256', clientSecret)
  .update(username + clientId)
  .digest('base64');

console.log('secretHash', secretHash);

// AWS CLI command
const command = `aws cognito-idp admin-initiate-auth --user-pool-id ${userPoolId} --client-id ${clientId} --auth-flow ADMIN_NO_SRP_AUTH --auth-parameters USERNAME=${username},PASSWORD='${password}',SECRET_HASH=${secretHash} --region ${region}`;
console.log(command);
