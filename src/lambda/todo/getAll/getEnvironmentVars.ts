export interface PutTodoEnvironmentVars {
  TODO_TABLE_NAME: string;
}

export const getEnvironmentVars = (): PutTodoEnvironmentVars => {
  if (!process.env.TODO_TABLE_NAME) {
    throw new Error(`Missing environment var TODO_TABLE_NAME`);
  }

  return {
    TODO_TABLE_NAME: process.env.TODO_TABLE_NAME
  };
};
