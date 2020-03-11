const { Parse } = global;
const { getQueryAuthOptions } = require('../utils');

const flatAccount = (account) => {
  const profilePhoto = account.get('user').get('profilePhoto');
  return {
    userId: account.get('user').id,
    accountId: account.id,
    profilePhoto: profilePhoto || null,
    username: account.get('username'),
    firstName: account.get('firstName'),
    lastName: account.get('lastName'),
  };
};

const findByUser = (user, master) => {
  const queryOptions = getQueryAuthOptions(user, master);
  const query = new Parse.Query('Account');
  query.include('user');
  query.equalTo('user', user.toPointer());
  return query.first(queryOptions);
};

module.exports = {
  flatAccount,
  findByUser,
};
