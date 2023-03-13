const isUserId = (userId: any): userId is string =>
  !!userId && typeof userId === 'string';

export default isUserId;
