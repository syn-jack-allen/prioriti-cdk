import { v4 as uuid } from 'uuid';
import { Todo } from '../../../interfaces/Todo';
import { mapDynamoTodo, mapTodoDynamo } from '../todo';

describe('Converting dynamo DB items to todo objects', () => {
  test('Works for a correctly formed dynamo DB item', () => {
    const item = {
      PK: '12345',
      SK: 'TODO#67890',
      Summary: 'test summary',
      Description: 'test description',
      Deadline: '1990-01-01',
      Color: 'blue'
    };

    const todo = mapDynamoTodo(item);

    expect(todo).toEqual({
      id: '67890',
      summary: 'test summary',
      description: 'test description',
      deadline: '1990-01-01',
      color: 'blue'
    });
  });

  test('Throws if todo ID is missing or malformed', () => {
    const itemMissing = {
      PK: '12345',
      Summary: 'test summary',
      Description: 'test description',
      Deadline: '1990-01-01',
      Color: 'blue'
    };

    const itemMalformed = {
      PK: '12345',
      SK: 'TODO#',
      Summary: 'test summary',
      Description: 'test description',
      Deadline: '1990-01-01',
      Color: 'blue'
    };

    expect(() => mapDynamoTodo(itemMissing)).toThrow();
    expect(() => mapDynamoTodo(itemMalformed)).toThrow();
  });

  test('Throws if summary is empty', () => {
    const item = {
      PK: '12345',
      SK: 'TODO#67890',
      Description: 'test description',
      Deadline: '1990-01-01',
      Color: 'blue'
    };

    expect(() => mapDynamoTodo(item)).toThrow();
  });

  test('Throws if deadline is empty', () => {
    const item = {
      PK: '12345',
      SK: 'TODO#67890',
      Summary: 'test summary',
      Color: 'blue'
    };

    expect(() => mapDynamoTodo(item)).toThrow();
  });

  test('Returns empty description if missing', () => {
    const item = {
      PK: '12345',
      SK: 'TODO#67890',
      Summary: 'test summary',
      Deadline: '1990-01-01',
      Color: 'blue'
    };

    const todo = mapDynamoTodo(item);

    expect(todo).toEqual({
      id: '67890',
      summary: 'test summary',
      description: '',
      deadline: '1990-01-01',
      color: 'blue'
    });
  });

  test('Returns default color if missing', () => {
    const item = {
      PK: '12345',
      SK: 'TODO#67890',
      Summary: 'test summary',
      Description: 'test description',
      Deadline: '1990-01-01'
    };

    const todo = mapDynamoTodo(item);

    expect(todo).toEqual({
      id: '67890',
      summary: 'test summary',
      description: 'test description',
      deadline: '1990-01-01',
      color: 'red'
    });
  });
});

describe('Converting todo objects to dynamo DB items', () => {
  test('Works for a fully populated todo item', () => {
    const id = uuid();

    const todo: Todo = {
      id,
      summary: 'test summary',
      description: 'test description',
      deadline: '1990-01-01',
      color: 'blue'
    };

    const dynamoItem = mapTodoDynamo(todo);

    expect(dynamoItem).toEqual({
      SK: `TODO#${id}`,
      Summary: 'test summary',
      Description: 'test description',
      Deadline: '1990-01-01',
      Color: 'blue'
    });
  });

  test('Omits description from item when empty', () => {
    const id = uuid();

    const todo: Todo = {
      id,
      summary: 'test summary',
      description: '',
      deadline: '1990-01-01',
      color: 'blue'
    };

    const dynamoItem = mapTodoDynamo(todo);

    expect(dynamoItem).toEqual({
      SK: `TODO#${id}`,
      Summary: 'test summary',
      Deadline: '1990-01-01',
      Color: 'blue'
    });
  });

  test('Omits color from item when empty', () => {
    const id = uuid();

    const todo: Todo = {
      id,
      summary: 'test summary',
      description: 'test description',
      deadline: '1990-01-01',
      color: ''
    };

    const dynamoItem = mapTodoDynamo(todo);

    expect(dynamoItem).toEqual({
      SK: `TODO#${id}`,
      Summary: 'test summary',
      Description: 'test description',
      Deadline: '1990-01-01'
    });
  });

  test('Throws when todo ID is empty or invalid format', () => {
    const todo: Omit<Todo, 'id'> = {
      summary: 'test summary',
      description: 'test description',
      deadline: '1990-01-01',
      color: ''
    };

    expect(() => mapTodoDynamo({ id: '', ...todo })).toThrow();
    expect(() => mapTodoDynamo({ id: '123', ...todo })).toThrow();
  });

  test('Throws when todo summary is empty', () => {
    const id = uuid();

    const todo: Todo = {
      id,
      summary: '',
      description: 'test description',
      deadline: '1990-01-01',
      color: ''
    };

    expect(() => mapTodoDynamo(todo)).toThrow();
  });
  test('Throws when todo deadline is empty', () => {
    const id = uuid();

    const todo: Todo = {
      id,
      summary: 'test summary',
      description: 'test description',
      deadline: '',
      color: ''
    };

    expect(() => mapTodoDynamo(todo)).toThrow();
  });
});
