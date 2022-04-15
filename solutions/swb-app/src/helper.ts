// This file contains code that we reuse between our tests.
import Fastify, { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import App from './app';

// Fill in this config with all the configurations
// needed for testing the application
async function config() {
  return {};
}

// Automatically build and tear down our instance
function testBuild() {
  const app = Fastify();

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup

  beforeAll(async () => {
    void app.register(fp(App), await config());
    await app.ready();
  });

  afterAll(() => app.close());

  return app;
}

function lambdaBuild(): FastifyInstance {
  const app = Fastify();
  app!.register(App);
  return app;
}

export { config, testBuild, lambdaBuild };
