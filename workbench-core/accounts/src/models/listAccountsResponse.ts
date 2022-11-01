import Account from './account';

export default interface ListAccountsResponse {
  data: Account[];
  paginationToken: string;
}
