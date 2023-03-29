import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { handler } from '../../delete';
import { deleteTodoEvent } from '../fixtures/deleteTodoEvent';

const mockDeleteTodo = jest.fn();

jest.mock('../../todo', () => {
  return {
    TodoProvider: jest.fn().mockImplementation(function () {
      return {
        deleteTodo: (...args: any[]) => mockDeleteTodo(...args)
      };
    })
  };
});

let event: APIGatewayProxyEventV2WithJWTAuthorizer = JSON.parse(
  JSON.stringify(deleteTodoEvent)
);

const userId = 'SPqLVBgJZmhgLCWis6GfxpWctA3fHZKA@clients';
const todoId = '185d1ac8-9587-49b8-8095-4aaa5a7d02cf';

describe('Get todo lambda', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(deleteTodoEvent));
    event.requestContext.authorizer.jwt.claims.sub = userId;
    (event.pathParameters as any).todoId =
      '185d1ac8-9587-49b8-8095-4aaa5a7d02cf';

    mockDeleteTodo.mockClear();
  });

  test('Healthy response', async () => {
    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
  });

  test('Calls todo provider with todo id', async () => {
    await handler(event, {} as Context, () => {});

    expect(mockDeleteTodo).toBeCalledWith(userId, todoId);
  });

  test('Returns 401 if missing JWT claim', async () => {
    event.requestContext.authorizer.jwt.claims.sub = '';
    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 401
      })
    );
  });

  test('Returns 404 if todo ID is missing', async () => {
    event.pathParameters = {};
    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 404
      })
    );
  });
});
