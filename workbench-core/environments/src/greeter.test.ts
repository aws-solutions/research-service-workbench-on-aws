import { Greeter } from './greeter';

const g = new Greeter();
const name = 'Bob';
describe('Hello tests', () => {
  it('test', () => {
    console.log('--aws-provider');
    expect(g.sayHello(name)).toStrictEqual('Hello, Bob');
  });
});

describe('Goodbye tests', () => {
  it('test', () => {
    expect(g.sayGoodbye(name)).toStrictEqual('Goodbye, Bob');
  });
});
