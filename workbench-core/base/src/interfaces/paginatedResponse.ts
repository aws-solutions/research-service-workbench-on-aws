export default interface PaginatedResponse<T> {
  data: T[];
  paginationToken?: string;
}
