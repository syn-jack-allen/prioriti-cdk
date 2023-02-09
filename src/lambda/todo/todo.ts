import DynamoDB, { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { validate as validateUuid } from 'uuid';
import { Todo } from '../../interfaces/Todo';
import { HttpError } from '../errors';

interface ProviderFailure {
  error: HttpError;
}

// maps todo object properties to their attribute names in DynamoDB
export const attributeNameMap = new Map([
  ['summary', 'Summary'],
  ['description', 'Description'],
  ['deadline', 'Deadline'],
  ['color', 'Color']
]);

/**
 * Maps a DynamoDB item to a todo object
 * @param attributes The attribute map from DynamoDB
 * @returns The todo object
 *
 * @throws If the attribute map is missing the SK, Summary or Deadline attributes; if the
 * todo ID cannot be retrieved from the SK, or the aforementioned attributes are not strings
 */
export const mapDynamoTodo = (attributes: AttributeMap): Todo => {
  if (!attributes.Summary?.S) throw new Error('Missing summary in todo item');
  if (!attributes.Deadline?.S) throw new Error('Missing deadline in todo item');
  if (!attributes.SK?.S) throw new Error('Missing sort key in todo item');

  const [, id] = attributes.SK.S.split('#');

  if (!id) throw new Error('Missing todo ID in todo item');

  return {
    id,
    summary: attributes.Summary.S,
    deadline: attributes.Deadline.S,
    description: attributes.Description?.S || '',
    color: attributes.Color?.S || 'red'
  };
};

/**
 * Maps a todo object to a DynamoDB attribute map
 * @param todo The todo object
 * @returns The DynamoDB attribute map
 *
 * @throws If the todo ID is an invalid UUID, or the summary or deadline properties are empty
 */
export const mapTodoDynamo = (todo: Todo): AttributeMap => {
  if (!validateUuid(todo.id))
    throw new Error(`Todo ID is not a valid UUID format`);

  if (!todo.summary) throw new Error('Todo summary cannot be empty');
  if (!todo.deadline) throw new Error('Todo deadline cannot be empty');

  const map: AttributeMap = { SK: { S: `TODO#${todo.id}` } };

  if (todo.summary) map.Summary = { S: todo.summary };
  if (todo.description) map.Description = { S: todo.description };
  if (todo.deadline) map.Deadline = { S: todo.deadline };
  if (todo.color) map.Color = { S: todo.color };

  return map;
};

export class TodoProvider {
  dynamodb: DynamoDB;

  tableName: string;

  constructor(dynamodb: DynamoDB, tableName: string) {
    this.dynamodb = dynamodb;
    this.tableName = tableName;
  }

  /**
   * Gets all todo objects associated with a single user
   * @param userId The user to get the todo objects of
   * @returns An array of todo objects
   */
  async getAllTodo(userId: string): Promise<Todo[]> {
    const params: DynamoDB.Types.QueryInput = {
      KeyConditionExpression: 'PK = :s AND begins_with (SK, :prefix)',
      ExpressionAttributeValues: {
        ':s': { S: userId },
        ':prefix': { S: 'TODO' }
      },
      TableName: this.tableName
    };

    const result = await this.dynamodb.query(params).promise();

    const transformedResults =
      result.Items?.map((item) => mapDynamoTodo(item)).sort((a, b) =>
        a.deadline > b.deadline ? 1 : -1
      ) || [];

    return transformedResults;
  }

  /**
   * Get a single todo object of a user by its ID
   * @param userId
   * @param todoId
   * @returns The todo object or undefined if the user doesn't have a todo object with
   * that ID
   */
  async getTodo(userId: string, todoId: string): Promise<Todo | undefined> {
    const params: DynamoDB.Types.GetItemInput = {
      Key: {
        PK: { S: userId },
        SK: { S: `TODO#${todoId}` }
      },
      TableName: this.tableName
    };

    const result = await this.dynamodb.getItem(params).promise();

    if (!result.Item) return undefined;

    const todo = mapDynamoTodo(result.Item);

    return todo;
  }

  /**
   * Creates a new todo object for a given user. If the user has
   * reached their limit of todo objects, then the transaction will fail
   * and an error will be thrown.
   * @param userId
   * @param todo
   */
  async postTodo(userId: string, todo: Todo) {
    const params: DynamoDB.Types.TransactWriteItemsInput = {
      TransactItems: [
        {
          Update: {
            Key: {
              PK: { S: userId },
              SK: { S: 'META#COUNT' }
            },
            ConditionExpression:
              'attribute_not_exists(CurrentCount) OR CurrentCount < :maxCount',
            UpdateExpression: 'ADD CurrentCount :val',
            ExpressionAttributeValues: {
              ':val': { N: '1' },
              ':maxCount': { N: '2' }
            },
            TableName: this.tableName
          }
        },
        {
          Put: {
            Item: {
              PK: {
                S: userId
              },
              SK: {
                S: `TODO#${todo.id}`
              },
              Summary: {
                S: todo.summary
              },
              Deadline: {
                S: todo.deadline
              },
              Description: {
                S: todo.description
              },
              Color: {
                S: todo.color
              }
            },
            TableName: this.tableName
          }
        }
      ]
    };

    await this.dynamodb.transactWriteItems(params).promise();
  }

  /**
   * Updates an existing todo object of a user. Will fail if the user
   * doesn't have a todo object with the given todo ID.
   *
   * The todo update object does not have to contain all properties of the todo object,
   * just the ones that wish to be changed.
   * @param userId
   * @param todoId
   * @param todoUpdate
   * @returns
   */
  async putTodo(
    userId: string,
    todoId: string,
    todoUpdate: Partial<Omit<Todo, 'id'>>
  ): Promise<Todo> {
    const expressionAttributeValues = Object.entries(todoUpdate).reduce(
      (expressionAttributeValues, [key, value]) => {
        expressionAttributeValues[`:${key}`] = { S: value };
        return expressionAttributeValues;
      },
      {} as any
    );

    const updateExpression = Object.entries(todoUpdate).reduce(
      (updateExpression, [key, value], index) => {
        if (index > 0) updateExpression += ', ';
        updateExpression += `${attributeNameMap.get(key)} = :${key}`;
        return updateExpression;
      },
      'SET '
    );

    const params: DynamoDB.Types.UpdateItemInput = {
      Key: {
        PK: { S: userId },
        SK: { S: `TODO#${todoId}` }
      },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(SK)',
      TableName: this.tableName
    };

    const result = await this.dynamodb.updateItem(params).promise();

    if (!result.Attributes)
      throw new Error('Missing attributes in dynamo update result');

    // map from dynamo attributes to JS object
    const todo = mapDynamoTodo(result.Attributes);

    return todo;
  }

  /**
   * Deletes
   * @param userId
   * @param todoId
   */
  async deleteTodo(userId: string, todoId: string): Promise<void> {
    const params: DynamoDB.Types.TransactWriteItemsInput = {
      TransactItems: [
        {
          Update: {
            Key: {
              PK: { S: userId },
              SK: { S: 'META#COUNT' }
            },
            UpdateExpression: 'ADD CurrentCount :val',
            ExpressionAttributeValues: {
              ':val': { N: '-1' }
            },
            TableName: this.tableName
          }
        },
        {
          Delete: {
            Key: {
              PK: {
                S: userId
              },
              SK: {
                S: `TODO#${todoId}`
              }
            },
            ConditionExpression: 'attribute_exists(SK)',
            TableName: this.tableName
          }
        }
      ]
    };

    await this.dynamodb.transactWriteItems(params).promise();
  }
}
