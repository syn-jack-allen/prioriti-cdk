import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from 'aws-lambda';
import { HttpError } from '../../../errors';
import { handler } from '../../post';
import { postTodoEvent } from '../fixtures/postTodoEvent';

const mockPostTodo = jest.fn();

jest.mock('../../todo', () => {
  return {
    TodoProvider: jest.fn().mockImplementation(function () {
      return {
        postTodo: (...args: any[]) => mockPostTodo(...args)
      };
    })
  };
});

let event: APIGatewayProxyEventV2WithJWTAuthorizer = JSON.parse(
  JSON.stringify(postTodoEvent)
);

const todo = {
  summary: 'test-summary',
  deadline: '2023-02-08',
  description: 'test-description',
  color: 'blue'
};

const userId = 'SPqLVBgJZmhgLCWis6GfxpWctA3fHZKA@clients';

describe('Get todo lambda', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(postTodoEvent));
    event.body = JSON.stringify(todo);
    event.requestContext.authorizer.jwt.claims.sub = userId;

    mockPostTodo.mockClear();
  });
  test('Healthy response', async () => {
    event.body = JSON.stringify({
      summary: 'test-summary',
      deadline: '2023-02-08',
      description: 'test-description',
      color: 'blue'
    });

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );

    expect(JSON.parse((lambdaResponse as any).body)).toEqual({
      todoId: expect.any(String)
    });
  });

  test('Calls todo provider with todo properties', async () => {
    await handler(event, {} as Context, () => {});

    expect(mockPostTodo).toBeCalledWith(userId, {
      ...todo,
      id: expect.any(String)
    });
  });

  test('Calls todo provider with default todo properties', async () => {
    const todo = {
      summary: 'test-summary',
      deadline: '2023-02-08'
    };

    // provide only required props (summary and deadline)
    event.body = JSON.stringify(todo);

    await handler(event, {} as Context, () => {});

    expect(mockPostTodo).toBeCalledWith(userId, {
      ...todo,
      description: '',
      color: 'red',
      id: expect.any(String)
    });
  });

  test('Returns 400 if required body properties are missing', async () => {
    const todo = {
      deadline: '2023-02-08'
    };

    // missing required props (summary)
    event.body = JSON.stringify(todo);

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 400
      })
    );
  });

  test('Returns 402 if max number of todos is reached', async () => {
    mockPostTodo.mockRejectedValueOnce(
      new HttpError(402, 'You have reached the maximum number of todos')
    );

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 402
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
