import { Context } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { handler } from '../getAll';
import { mockGetAllTodo } from '../__mocks__/todo';
import { getAllTodoEvent } from './fixtures/getAllTodoEvent';
jest.mock('../../lambda/todo/todo');

let event = getAllTodoEvent;

describe('Get all todo lambda', () => {
  beforeAll(() => {
    process.env.TODO_TABLE_NAME = 'test';
  });

  beforeEach(() => {
    event = { ...getAllTodoEvent };
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

  describe('Paginates correctly', () => {
    test('For no todos', async () => {
      const lambdaResponse = await handler(event, {} as Context, () => {});

      expect(lambdaResponse).toEqual(
        expect.objectContaining({
          statusCode: 200,
          pageSize: 1,
          pageNumber: 1,
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
          statusCode: 200,
          results: expect.arrayContaining([todoA, todoB]),
          pageNumber: 1,
          pageSize: 2,
          totalResults: 2
        })
      );
    });
  });
});
