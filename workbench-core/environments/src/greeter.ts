export class Greeter {
  private readonly _salutation: string;
  private readonly _leaving: string;

  public constructor(salutation: string = 'Hello, ', leaving: string = 'Goodbye, ') {
    this._salutation = salutation;
    this._leaving = leaving;
  }

  public sayHello(name: string): string {
    console.log('test change');
    return this._salutation + name;
  }
  public sayGoodbye(name: string): string {
    return this._leaving + name;
  }
}
