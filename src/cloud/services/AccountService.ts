const { getQueryAuthOptions } = require('../utils');

const findByUser = (user: Parse.User, master: boolean): Promise<Parse.Object | undefined> => {
  const queryOptions = getQueryAuthOptions(user, master);
  const query = new Parse.Query('Account');
  query.include('user');
  query.equalTo('user', user.toPointer());
  return query.first(queryOptions);
};

export default {
  findByUser,
};
