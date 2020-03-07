const utils = require('../utils');

module.exports = async (Parse) => {
  const { account } = await utils.createTestAccount(Parse);
  const testUser = await Parse.User.logIn(account.get('username'), 'securePass');
  return testUser;
};
