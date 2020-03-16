const { Parse, testUser } = global;
const AccountService = require('../cloud/services/AccountService');
const utils = require('./utils');

beforeAll(() => {
  utils.registerClasses();
});

describe('AccountService tests', () => {
  test('flatAccount should flat account resource', async () => {
    const fakeAccount = await utils.createTestAccount(Parse);
    // need to instance Account in order to use flat function
    const account = await new Parse.Query('Account').get(fakeAccount.id, { useMasterKey: true });
    const flattedAccount = account.flat();
    expect(flattedAccount).toHaveProperty('userId');
    expect(flattedAccount).toHaveProperty('accountId');
    expect(flattedAccount).toHaveProperty('profilePhoto');
    expect(flattedAccount).toHaveProperty('username');
    expect(flattedAccount).toHaveProperty('lastName');
    await fakeAccount.destroy({ useMasterKey: true });
  });

  test('findByUser should find an account by user', async () => {
    const account = await AccountService.findByUser(testUser);
    expect(account.get('user').id).toBe(testUser.id);
  });
});
