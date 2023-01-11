import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export interface Todo {
  id: string;
  summary: string;
  description: string;
  deadline: string;
  color: string;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalResults: number;
}

export interface GetTodoResponseBody {
  data: Todo;
}

export interface GetTodoResponse
  extends Omit<APIGatewayProxyStructuredResultV2, 'body'> {
  body: GetTodoResponseBody;
}

export interface GetAllTodoResponseBody extends Pagination {
  results: Todo[];
}

export interface GetAllTodoResponse
  extends Omit<APIGatewayProxyStructuredResultV2, 'body'> {
  body: GetAllTodoResponseBody;
}
