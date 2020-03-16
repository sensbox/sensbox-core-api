const { Parse, testUser } = global;
const utils = require('./utils');

const UserService = require('../cloud/services/UserService');

beforeAll(() => {
  utils.registerClasses();
});

describe('UserService tests', () => {
  test('clear all active sessions for a given user', async () => {
    const fakeAccount = await utils.createTestAccount(Parse);
    const fakeUser = await Parse.User.logIn(fakeAccount.get('username'), 'securePass');
    const sessionToken = fakeUser.getSessionToken();
    const { sessions } = await UserService.clearUserSessions(fakeUser);
    expect(sessions).not.toBeUndefined();
    expect(sessions).toContain(sessionToken);
    const sessionQuery = new Parse.Query(Parse.Session);
    sessionQuery.equalTo('user', fakeUser);
    const results = await sessionQuery.find({ useMasterKey: true });
    expect(results).toEqual([]);
    fakeAccount.destroy({ useMasterKey: true });
  });

  describe('Request Object Permissions', () => {
    test('requestObjectPermissions should return an expection when no className or objectId are provided', async () => {
      const EXCECPTION_MESSAGE = 'Invalid Parameters: className and objectId should be provided';
      try {
        await UserService.requestObjectPermissions();
      } catch (error) {
        expect(error.message).toMatch(EXCECPTION_MESSAGE);
      }
      try {
        await UserService.requestObjectPermissions('Device');
      } catch (error) {
        expect(error.message).toMatch(EXCECPTION_MESSAGE);
      }

      try {
        await UserService.requestObjectPermissions(null, '123');
      } catch (error) {
        expect(error.message).toMatch(EXCECPTION_MESSAGE);
      }
    });

    test('requestObjectPermissions should return an expection when className is invalid', async () => {
      const className = 'invalidClassName';
      try {
        await UserService.requestObjectPermissions(className, '1', testUser);
      } catch (error) {
        expect(error.message).toMatch(
          `This user is not allowed to access non-existent class: ${className}`,
        );
      }
    });

    test('requestObjectPermissions should return an exception when objectId not found', async () => {
      const className = 'Device';
      const objectId = 'badObjectId';
      try {
        await UserService.requestObjectPermissions(className, objectId, testUser);
      } catch (error) {
        expect(error.message).toMatch('Object not found.');
      }
    });

    test('requestObjectPermissions should return resurces permissions', async () => {
      const device = new Parse.Object('Device');
      device.set('uuid', '12345');
      try {
        await device.save(null, { sessionToken: testUser.getSessionToken() });
        const { permissions } = await UserService.requestObjectPermissions(
          'Device',
          device.id,
          testUser,
        );
        expect(permissions).toHaveProperty('public');
        expect(permissions.public).toStrictEqual({ read: false, write: false });
        expect(permissions).toHaveProperty('users');
        permissions.users.forEach((user) => {
          expect(user).toHaveProperty('userId');
          expect(user).toHaveProperty('read');
          expect(user).toHaveProperty('write');
          expect(user).toHaveProperty('account');
        });
      } finally {
        await device.destroy({ useMasterKey: true });
      }
    });
  });

  describe('FindUsers By Text tests', () => {
    test('Find users by text should not fetch the user that request endpoint', async () => {
      const text = 'jest';
      const results = await UserService.findUsersByText(text, testUser);
      expect(results.map((a) => a.accountId)).not.toContain([testUser.id]);
    });

    test('Find users by text should only fetch users that matchs text', async () => {
      const text = 'jest';

      let accounts = [];
      try {
        accounts = await Promise.all([
          utils.createTestAccount(Parse),
          utils.createTestAccount(Parse),
          utils.createTestAccount(Parse, 'fakeName'),
        ]);

        const fakeAccount = accounts[2];

        const results = await UserService.findUsersByText(text, testUser);
        expect(results).toHaveLength(2);
        expect(results.map((a) => a.accountId)).toEqual(
          expect.arrayContaining(accounts.slice(0, 2).map((account) => account.id)),
        );
        expect(results.map((a) => a.accountId)).not.toContain(fakeAccount.id);
      } finally {
        await Promise.all(accounts.map((a) => a.destroy({ useMasterKey: true })));
      }
    });

    test('Find users by text should find user by account information', async () => {
      const text = 'fakeFirstName';
      let fakeAccount1 = null;
      try {
        const account = await utils.createTestAccount(
          Parse,
          'fakeFirstName',
          'notSearchBythisUsername',
        );
        fakeAccount1 = account;
        const results = await UserService.findUsersByText(text, testUser);
        expect(results).toHaveLength(1);
        expect(results.map((a) => a.accountId)).toContain(fakeAccount1.id);
      } finally {
        if (fakeAccount1) await fakeAccount1.destroy({ useMasterKey: true });
      }
    });
  });
});
