const { Parse } = global;
const { getQueryAuthOptions } = require('../utils');

const findByUser = (user, master) => {
  const queryOptions = getQueryAuthOptions(user, master);
  const query = new Parse.Query('Account');
  query.include('user');
  query.equalTo('user', user.toPointer());
  return query.first(queryOptions);
};

module.exports = {
  findByUser,
};
