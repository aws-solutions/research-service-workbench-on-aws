#!/usr/bin/env node

const pkceChallenge = require('pkce-challenge').default;
const { v4: uuid } = require('uuid');

const challenge = pkceChallenge(128);

console.log(`CodeChallenge: ${challenge.code_challenge}`);
console.log(`CodeVerifier: ${challenge.code_verifier}`);
console.log(`StateVerifier: ${uuid()}`);
