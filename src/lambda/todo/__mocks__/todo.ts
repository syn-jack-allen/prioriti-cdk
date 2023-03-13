export const mockGetAllTodo = jest.fn().mockResolvedValue([]);
export const TodoProvider = jest.fn().mockImplementation(function () {
  return {
    getAllTodo: mockGetAllTodo
  };
});
