import QueryParams from '../constants/queryParams';
import ExecuteQueryResult from './executeQueryResult';

export default interface DatabaseService {
  executeQuery(params?: QueryParams): Promise<ExecuteQueryResult>;
}
