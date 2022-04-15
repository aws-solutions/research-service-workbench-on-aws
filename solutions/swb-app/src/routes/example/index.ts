import { Greeter } from '../../../../../workbench-core/environments';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';

type MyRequest = FastifyRequest<{
  Params: { name: string };
}>;

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const greeter = new Greeter();
  fastify.get('/', async function (request, reply) {
    return 'this is an example';
  });
  fastify.get('/:name', async function (request: MyRequest, reply) {
    return greeter.sayHello(request.params.name);
  });
};

export default example;
