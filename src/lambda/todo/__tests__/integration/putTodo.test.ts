import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { handler } from '../../put';
import { putTodoEvent } from '../fixtures/putTodoEvent';

const mockPutTodo = jest.fn();

jest.mock('../../todo', () => {
  return {
    TodoProvider: jest.fn().mockImplementation(function () {
      return {
        putTodo: (...args: any[]) => mockPutTodo(...args)
      };
    })
  };
});

let event: APIGatewayProxyEventV2WithJWTAuthorizer = JSON.parse(
  JSON.stringify(putTodoEvent)
);

const todo = {
  summary: 'test-summary',
  deadline: '2023-02-08',
  description: 'test-description',
  color: 'blue'
};

const userId = 'SPqLVBgJZmhgLCWis6GfxpWctA3fHZKA@clients';
const todoId = '185d1ac8-9587-49b8-8095-4aaa5a7d02cf';

describe('Get todo lambda', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(putTodoEvent));
    event.body = JSON.stringify(todo);
    event.requestContext.authorizer.jwt.claims.sub = userId;
    event.pathParameters = {
      todoId
    };

    mockPutTodo.mockClear();
  });
  test('Healthy response', async () => {
    event.body = JSON.stringify(todo);

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
  });

  test('Calls todo provider with todo properties', async () => {
    event.body = JSON.stringify(todo);

    await handler(event, {} as Context, () => {});

    expect(mockPutTodo).toBeCalledWith(userId, todoId, {
      ...todo
    });
  });

  test('Returns 400 if no properties are sent with body', async () => {
    // missing required props (summary)
    event.body = JSON.stringify({});

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 400
      })
    );
  });

  test('Returns 404 if todo ID does not exist', async () => {
    const error = new Error('') as any;
    error.name = 'ConditionalCheckFailedException';

    mockPutTodo.mockRejectedValueOnce(error);

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 404
      })
    );
  });

  test('Returns 400 if missing todo ID', async () => {
    event.pathParameters = {};
    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 400
      })
    );
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
});
