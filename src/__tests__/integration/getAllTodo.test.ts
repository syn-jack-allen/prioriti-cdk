import { Context } from 'aws-lambda';
import { getAllTodoEvent } from '../../fixtures/getAllTodoEvent';
import { handler } from '../../lambda/todo/getAll';

let event = getAllTodoEvent;

const mockGetAllTodo = jest.fn();

jest.mock('../../lambda/todo/todo', () => {
  getAllTodo: mockGetAllTodo;
});

describe('Get all todo lambda', () => {
  beforeEach(() => {
    event = { ...getAllTodoEvent };
    mockGetAllTodo.mockClear();
  });
  test('Healthy response', () => {
    const lambdaResponse = handler(event, {} as Context, () => {});

    expect(lambdaResponse).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
  });
});
