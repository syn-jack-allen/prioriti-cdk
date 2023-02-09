import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { v4 as uuid } from 'uuid';
import { Todo } from '../interfaces/Todo';
import { mapDynamoTodo, mapTodoDynamo } from '../lambda/todo/todo';

describe('Converting dynamo DB items to todo objects', () => {
  test('Works for a correctly formed dynamo DB item', () => {
    const item: AttributeMap = {
      PK: { S: '12345' },
      SK: { S: 'TODO#67890' },
      Summary: { S: 'test summary' },
      Description: { S: 'test description' },
      Deadline: { S: '1990-01-01' },
      Color: { S: 'blue' }
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
    const itemMissing: AttributeMap = {
      PK: { S: '12345' },
      Summary: { S: 'test summary' },
      Description: { S: 'test description' },
      Deadline: { S: '1990-01-01' },
      Color: { S: 'blue' }
    };

    const itemMalformed: AttributeMap = {
      PK: { S: '12345' },
      SK: { S: 'TODO#' },
      Summary: { S: 'test summary' },
      Description: { S: 'test description' },
      Deadline: { S: '1990-01-01' },
      Color: { S: 'blue' }
    };

    expect(() => mapDynamoTodo(itemMissing)).toThrow();
    expect(() => mapDynamoTodo(itemMalformed)).toThrow();
  });

  test('Throws if summary is empty', () => {
    const item: AttributeMap = {
      PK: { S: '12345' },
      SK: { S: 'TODO#67890' },
      Description: { S: 'test description' },
      Deadline: { S: '1990-01-01' },
      Color: { S: 'blue' }
    };

    expect(() => mapDynamoTodo(item)).toThrow();
  });

  test('Throws if deadline is empty', () => {
    const item: AttributeMap = {
      PK: { S: '12345' },
      SK: { S: 'TODO#67890' },
      Summary: { S: 'test summary' },
      Color: { S: 'blue' }
    };

    expect(() => mapDynamoTodo(item)).toThrow();
  });

  test('Returns empty description if missing', () => {
    const item: AttributeMap = {
      PK: { S: '12345' },
      SK: { S: 'TODO#67890' },
      Summary: { S: 'test summary' },
      Deadline: { S: '1990-01-01' },
      Color: { S: 'blue' }
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
    const item: AttributeMap = {
      PK: { S: '12345' },
      SK: { S: 'TODO#67890' },
      Summary: { S: 'test summary' },
      Description: { S: 'test description' },
      Deadline: { S: '1990-01-01' }
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
      SK: { S: `TODO#${id}` },
      Summary: { S: 'test summary' },
      Description: { S: 'test description' },
      Deadline: { S: '1990-01-01' },
      Color: { S: 'blue' }
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
      SK: { S: `TODO#${id}` },
      Summary: { S: 'test summary' },
      Deadline: { S: '1990-01-01' },
      Color: { S: 'blue' }
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
      SK: { S: `TODO#${id}` },
      Summary: { S: 'test summary' },
      Description: { S: 'test description' },
      Deadline: { S: '1990-01-01' }
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
