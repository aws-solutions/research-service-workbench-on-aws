export default class HttpError extends Error {
  statusCode: number;
  body: any;
  constructor(statusCode: number, body: any);
  isEqual(error: Error): boolean;
}
//# sourceMappingURL=HttpError.d.ts.map
