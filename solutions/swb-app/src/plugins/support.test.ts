import Fastify from 'fastify';
import Support from './support';

test('support works standalone', async () => {
  const fastify = Fastify();
  void fastify.register(Support);
  await fastify.ready();

  expect(fastify.someSupport()).toBe('hugs');

  await fastify.close();
});
