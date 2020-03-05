jest.mock('../cloud/utils/core');

const { Parse, testUser } = global;
const utils = require('./utils');
const { getDatabaseInstance } = require('../cloud/utils/core');
const { secure } = require('../cloud/utils');
const { Common } = require('../cloud/functions');

beforeAll(() => {
  // eslint-disable-next-line no-underscore-dangle
  getDatabaseInstance.mockReturnValue(global.__TEST_ENVIRONMENT__.database);
  Common.requestObjectPermissions = secure(Common.requestObjectPermissions);
  Common.requestDeviceKey = secure(Common.requestDeviceKey);
  Common.findUsersByText = secure(Common.findUsersByText);
});

describe('Common Cloud Functions', () => {
  test('requestObjectPermissions should return an expection when no className or objectId are provided', async () => {
    const EXCECPTION_MESSAGE = 'Invalid Parameters: className and objectId should be provided';
    try {
      await Common.requestObjectPermissions({ user: testUser, params: {} });
    } catch (error) {
      expect(error.message).toMatch(EXCECPTION_MESSAGE);
    }
    try {
      await Common.requestObjectPermissions({ user: testUser, params: { className: 'Device' } });
    } catch (error) {
      expect(error.message).toMatch(EXCECPTION_MESSAGE);
    }

    try {
      await Common.requestObjectPermissions({ user: testUser, params: { objectId: '123' } });
    } catch (error) {
      expect(error.message).toMatch(EXCECPTION_MESSAGE);
    }
  });

  test('requestObjectPermissions should return an expection when className is invalid', async () => {
    const className = 'invalidClassName';
    try {
      await Common.requestObjectPermissions({ user: testUser, params: { className, objectId: 1 } });
    } catch (error) {
      expect(error.message).toMatch(
        `This user is not allowed to access non-existent class: ${className}`,
      );
    }
  });

  test('requestObjectPermissions should return an expection when objectId not found', async () => {
    const className = 'Device';
    const objectId = 'badObjectId';
    try {
      await Common.requestObjectPermissions({ user: testUser, params: { className, objectId } });
    } catch (error) {
      expect(error.message).toMatch('Object not found.');
    }
  });

  test('requestObjectPermissions should return resurces permissions', async () => {
    const device = new Parse.Object('Device');
    device.set('uuid', '12345');
    try {
      await device.save(null, { sessionToken: testUser.getSessionToken() });
      const { permissions } = await Common.requestObjectPermissions({
        user: testUser,
        params: { className: 'Device', objectId: device._getId() },
      });
      expect(permissions).toHaveProperty('public');
      expect(permissions.public).toStrictEqual({ read: false, write: false });
      expect(permissions).toHaveProperty('users');
      permissions.users.map((user) => {
        expect(user).toHaveProperty('userId');
        expect(user).toHaveProperty('read');
        expect(user).toHaveProperty('write');
        expect(user).toHaveProperty('account');
      });
    } finally {
      await device.destroy({ useMasterKey: true });
    }
  });

  // test('requestObjectPermissions should not return permissions from forbidden resurces', async () => {});

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

  describe('Test RequestDeviceKey function', () => {
    // beforeEach(() => {
    //   // eslint-disable-next-line no-underscore-dangle
    //   getDatabaseInstance.mockReturnValue(global.__TEST_ENVIRONMENT__.database);
    // });

    test('RequestDeviceKey without user should throw an execptiom', async () => {
      try {
        const params = {};
        await Common.requestDeviceKey({ params });
      } catch (error) {
        expect(error.message).toMatch('User needs to be authenticated');
      }
    });

    test('RequestDeviceKey with bad password should throw an execption', async () => {
      try {
        const params = {
          password: 'badPasword',
        };
        await Common.requestDeviceKey({ user: testUser, params });
      } catch (error) {
        expect(error.message).toMatch('Forbidden');
      }
    });

    test('RequestDeviceKey should return the device key to a device created from owner', async () => {
      const device = new Parse.Object('Device');
      device.set('uuid', '12345');

      try {
        await device.save(null, { sessionToken: testUser.getSessionToken() });

        const params = {
          uuid: '12345',
          password: 'securePass',
        };
        const result = await Common.requestDeviceKey({ user: testUser, params });
        expect(result).toHaveProperty('key');
        expect(result.key).not.toBeUndefined();
        expect(result.key).not.toBeNull();
      } finally {
        await device.destroy({ useMasterKey: true });
      }
    });

    test('RequestDeviceKey should return device not found exepction', async () => {
      const device = new Parse.Object('Device');
      device.set('uuid', '12345');
      try {
        await device.save(null, { sessionToken: testUser.getSessionToken() });
        const params = {
          uuid: 'badUuid',
          password: 'securePass',
        };
        await Common.requestDeviceKey({ user: testUser, params });
      } catch (error) {
        expect(error.message).toMatch('Device Not Found');
      } finally {
        await device.destroy({ useMasterKey: true });
      }
    });

    test('RequestDeviceKey should return device not found exepction for not owner user', async () => {
      const { account: fakeAccount } = await utils.createTestAccount(Parse);
      const device = new Parse.Object('Device');
      device.set('uuid', '12345');
      device.set('createdBy', fakeAccount.get('user'));
      try {
        await device.save(null, { useMasterKey: true });
        const params = {
          uuid: '12345',
          password: 'securePass',
        };
        await Common.requestDeviceKey({ user: testUser, params });
      } catch (error) {
        expect(error.message).toMatch('Device Not Found');
      } finally {
        await device.destroy({ useMasterKey: true });
      }
    });
  });
});
