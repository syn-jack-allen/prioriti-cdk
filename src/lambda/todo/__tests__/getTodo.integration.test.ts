import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { handler } from '../get';
import { getTodoEvent } from './fixtures/getTodoEvent';

const mockGetTodo = jest.fn().mockResolvedValue({
  id: '185d1ac8-9587-49b8-8095-4aaa5a7d02cf',
  summary: 'test-summary',
  description: 'test-description',
  deadline: Date.parse('2023-04-05'),
  color: 'red'
});

jest.mock('../todo', () => {
  return {
    TodoProvider: jest.fn().mockImplementation(function () {
      return {
        getTodo: (...args: any[]) => mockGetTodo(...args)
      };
    })
  };
});

let event: APIGatewayProxyEventV2WithJWTAuthorizer = JSON.parse(
  JSON.stringify(getTodoEvent)
);

describe('Get todo lambda', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(getTodoEvent));
    mockGetTodo.mockClear();
  });
  test('Healthy response', async () => {
    event.pathParameters = {
      todoId: '185d1ac8-9587-49b8-8095-4aaa5a7d02cf'
    };

    mockGetTodo.mockResolvedValueOnce({
      id: '185d1ac8-9587-49b8-8095-4aaa5a7d02cf',
      summary: 'test-summary',
      description: 'test-description',
      deadline: Date.parse('2023-04-05').toString(),
      color: 'red'
    });

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );

    expect(JSON.parse((lambdaResponse as any).body)).toEqual({
      data: expect.objectContaining({
        id: '185d1ac8-9587-49b8-8095-4aaa5a7d02cf',
        summary: 'test-summary',
        description: 'test-description',
        deadline: Date.parse('2023-04-05').toString(),
        color: 'red'
      })
    });
  });

  test('Returns 400 if todo ID does not exist', async () => {
    event.pathParameters = {
      todoId: ''
    };

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 400
      })
    );
  });

  test('Missing JWT sub results in unauthenticated error', async () => {
    event.requestContext.authorizer.jwt.claims.sub = '';
    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 401
      })
    );
  });

  test('Returns 404 if todo does not exist', async () => {
    event.pathParameters = {
      todoId: '185d1ac8-9587-49b8-8095-4aaa5a7d02cf'
    };

    mockGetTodo.mockResolvedValueOnce(null);

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 404
      })
    );
  });
});
