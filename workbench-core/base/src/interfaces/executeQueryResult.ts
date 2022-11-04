export default interface ExecuteQueryResult {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  paginationToken?: string;
}
