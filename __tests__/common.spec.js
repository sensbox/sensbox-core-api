const { Parse, testUser } = global;
const utils = require('./utils');
const { Common } = require('../cloud/functions');

describe('Common Cloud Functions', () => {
  test('Flat account is doing right', async () => {
    const accountQuery = new Parse.Query('Account');
    accountQuery.equalTo('user', testUser);
    const parseAccount = await accountQuery.first({ sessionToken: testUser.getSessionToken() });
    const account = Common.flatAccount(parseAccount);
    expect(typeof account).toBe('object');
    expect(account).toHaveProperty('userId');
    expect(account).toHaveProperty('accountId');
    expect(account).toHaveProperty('profilePhoto');
    expect(account).toHaveProperty('username');
    expect(account).toHaveProperty('lastName');
  });

  test('Find users by text should not fetch the user that request endpoint', async () => {
    const params = {
      text: 'jest',
    };
    const results = await Common.findUsersByText({ params, user: testUser });
    expect(results.map((a) => a.accountId)).not.toContain([testUser._getId()]);
  });

  test('Find users by text should only fetch users that matchs text', async () => {
    const params = {
      text: 'jest',
    };
    let fakeAccount1 = null;
    let fakeAccount2 = null;
    let fakeAccount3 = null;
    try {
      const accounts = await Promise.all([
        utils.createTestAccount(Parse),
        utils.createTestAccount(Parse),
        utils.createTestAccount(Parse, 'fakeName'),
      ]);

      fakeAccount1 = accounts[0].account;
      fakeAccount2 = accounts[1].account;
      fakeAccount3 = accounts[2].account;

      const results = await Common.findUsersByText({ params, user: testUser });
      expect(results).toHaveLength(2);
      expect(results.map((a) => a.accountId)).toEqual(
        expect.arrayContaining(accounts.slice(0, 2).map(({ account }) => account._getId())),
      );
      expect(results.map((a) => a.accountId)).not.toContain(fakeAccount3._getId());
    } finally {
      if (fakeAccount1) fakeAccount1.destroy({ useMasterKey: true });
      if (fakeAccount2) fakeAccount2.destroy({ useMasterKey: true });
      if (fakeAccount3) fakeAccount3.destroy({ useMasterKey: true });
    }
  });

  test('Find users by text should find user by account information', async () => {
    const params = {
      text: 'fakeFirstName',
    };
    let fakeAccount1 = null;
    try {
      const accounts = await Promise.all([utils.createTestAccount(Parse)]);

      fakeAccount1 = accounts[0].account;
      fakeAccount1.set('firstName', 'fakeFirstName');
      await fakeAccount1.save(null, { useMasterKey: true });
      const results = await Common.findUsersByText({ params, user: testUser });
      expect(results).toHaveLength(1);
      expect(results.map((a) => a.accountId)).toContain(fakeAccount1._getId());
    } finally {
      if (fakeAccount1) fakeAccount1.destroy({ useMasterKey: true });
    }
  });

  test('Find users by text should return forbidden exception', async () => {
    const params = {
      text: 'test',
    };
    try {
      await Common.findUsersByText({ params, user: undefined });
    } catch (error) {
      expect(error.message).toMatch('User needs to be authenticated');
    }
  });
});
