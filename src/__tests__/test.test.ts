describe('a test for github actions CI', () => {
  test('a passing test', () => {
    expect(1).toBe(1);
  });
  test('a failing test', () => {
    expect(1).toBe(2);
  });
});
