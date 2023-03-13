import { Context } from 'aws-lambda';
import { getAllTodoEvent } from '../../fixtures/getAllTodoEvent';
import { handler } from '../../lambda/todo/getAll';
import { mockGetAllTodo } from '../../lambda/todo/__mocks__/todo';
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
});
