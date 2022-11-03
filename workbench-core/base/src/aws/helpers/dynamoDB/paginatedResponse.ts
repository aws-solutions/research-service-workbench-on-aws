export default interface PaginatedResponse<T> {
  paginationToken?: string;
  data: T[];
}
