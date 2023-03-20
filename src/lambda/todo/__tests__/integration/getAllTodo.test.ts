import { Context } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { handler } from '../../getAll';
import { getAllTodoEvent } from '../fixtures/getAllTodoEvent';

const mockGetAllTodo = jest.fn().mockResolvedValue([]);

jest.mock('../../todo', () => {
  return {
    TodoProvider: jest.fn().mockImplementation(() => {
      return {
        getAllTodo: (...args: any[]) => mockGetAllTodo(...args)
      };
    })
  };
});

let event = { ...getAllTodoEvent };

describe('Get all todo lambda', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(getAllTodoEvent));
    mockGetAllTodo.mockClear();
  });

  test('Healthy response', async () => {
    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
  });

  test('Can respond with multiple todos', async () => {
    const id = uuid();
    mockGetAllTodo.mockResolvedValueOnce([
      {
        id,
        summary: 'test-summary',
        description: 'test-description',
        deadline: Date.parse('2023-04-05'),
        color: 'red'
      }
    ]);

    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );

    expect(JSON.parse((lambdaResponse as any).body)).toEqual(
      expect.objectContaining({
        results: [
          {
            id,
            summary: 'test-summary',
            description: 'test-description',
            deadline: Date.parse('2023-04-05').toString(),
            color: 'red'
          }
        ]
      })
    );
  });

  test('Missing JWT sub results in unauthenticated error', async () => {
    event.requestContext.authorizer.jwt.claims.sub = '';
    const lambdaResponse = await handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 401,
        body: JSON.stringify({
          error: { message: 'Unable to authenticate user' }
        })
      })
    );
  });

  describe('Paginates correctly', () => {
    test('For no todos', async () => {
      const lambdaResponse = await handler(event, {} as Context, () => {});

      expect(lambdaResponse).toEqual(
        expect.objectContaining({
          statusCode: 200
        })
      );

      expect(JSON.parse((lambdaResponse as any).body)).toEqual(
        expect.objectContaining({
          pageNumber: 1,
          pageSize: 1,
          totalResults: 0
        })
      );
    });
    test('For multiple todos', async () => {
      const todoA = {
        id: uuid(),
        summary: 'summary-a',
        description: 'description-a',
        deadline: Date.parse('2023-03-03'),
        color: 'red'
      };

      const todoB = {
        id: uuid(),
        summary: 'summary-b',
        description: 'description-b',
        deadline: Date.parse('1999-12-31'),
        color: 'blue'
      };

      mockGetAllTodo.mockResolvedValueOnce([todoA, todoB]);

      const lambdaResponse = await handler(event, {} as Context, () => {});

      expect(lambdaResponse).toEqual(
        expect.objectContaining({
          statusCode: 200
        })
      );

      expect(JSON.parse((lambdaResponse as any).body)).toEqual(
        expect.objectContaining({
          results: expect.arrayContaining([todoA, todoB]),
          pageNumber: 1,
          pageSize: 2,
          totalResults: 2
        })
      );
    });
  });
});
