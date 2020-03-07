const { Parse } = global;
const passwordCrypto = require('parse-server/lib/password');
const { getDatabaseInstance } = require('../utils/core');
const { flatAccount } = require('../utils');

const ping = () => ({
  msg: 'pong',
  time: new Date(),
});

// TODO: check if there is a need of control roles
const findUsersByText = async (request) => {
  const { user, params } = request;
  const { text } = params;
  // Query for username or email in _User Class
  const usernameQuery = new Parse.Query('_User');
  usernameQuery.matches('username', new RegExp(`${text}`, 'i'));
  const emailQuery = new Parse.Query('_User');
  emailQuery.matches('email', new RegExp(`${text}`, 'i'));
  const userQuery = Parse.Query.or(usernameQuery, emailQuery);

  // Prevent to fetch the user that request endpoint
  userQuery.notEqualTo('objectId', user.id);
  let result = await userQuery.find({ useMasterKey: true });
  if (result.length > 0) {
    const promises = result.map((u) => {
      const query = new Parse.Query('Account');
      query.include('user');
      query.equalTo('user', u.toPointer());
      return query.first({ useMasterKey: true });
    });

    const results = await Promise.all(promises);
    return results.map((a) => flatAccount(a));
  }
  // If no results, will query on Account Class
  const firstNameQuery = new Parse.Query('Account');
  firstNameQuery.matches('firstName', new RegExp(`${text}`, 'i'));
  const lastNameQuery = new Parse.Query('Account');
  lastNameQuery.matches('lastName', new RegExp(`${text}`, 'i'));
  const accountQuery = Parse.Query.or(firstNameQuery, lastNameQuery);
  accountQuery.include('user');

  // Prevent to fetch the user that request endpoint
  accountQuery.notEqualTo('user', user.toPointer());
  result = await accountQuery.find({ useMasterKey: true });
  return result.map((a) => flatAccount(a));
};

const requestObjectPermissions = async (request) => {
  const { user, master, params } = request;
  const { className, objectId } = params;
  if (!(className && objectId)) {
    throw new Parse.Error(400, 'Invalid Parameters: className and objectId should be provided');
  }
  const objectQuery = new Parse.Query(className);
  const options = master ? { useMasterKey: true } : { sessionToken: user.getSessionToken() };
  const object = await objectQuery.get(objectId, options);
  const ACL = object.getACL();
  const permissions = {
    public: {
      read: ACL.getPublicReadAccess(),
      write: ACL.getPublicWriteAccess(),
    },
  };

  const promises = Object.keys(ACL.permissionsById).map(async (userId) => {
    const query = new Parse.Query('Account');
    const User = Parse.Object.extend('_User');
    query.equalTo('user', User.createWithoutData(userId).toPointer());
    query.include('user');
    const account = await query.first({ useMasterKey: true });
    if (account) {
      return {
        userId,
        read: ACL.permissionsById[userId].read,
        write: ACL.permissionsById[userId].write,
        account: flatAccount(account),
      };
    }
    return null;
  });

  const users = await Promise.all(promises);
  permissions.users = users.filter((u) => !!u);
  return { permissions };
};

const requestDeviceKey = async (request) => {
  const { user, params } = request;
  const { uuid, password } = params;
  const database = getDatabaseInstance();
  const userCollection = database.collection('_User');
  const currentUser = await userCollection.findOne({
    _id: user.id,
  });
  // eslint-disable-next-line no-underscore-dangle
  const passwordsMatch = await passwordCrypto.compare(password, currentUser._hashed_password);
  if (!passwordsMatch) throw new Parse.Error(403, 'Forbidden');
  const query = new Parse.Query('Device');
  query.equalTo('uuid', uuid);

  // query needs to be done as root because key is protected as normal user
  const options = { useMasterKey: true };
  const device = await query.first(options);
  let key = null;
  if (!device) throw new Parse.Error(404, 'Device Not Found');
  const deviceACL = device.getACL();
  const isPublic = (deviceACL && deviceACL.getPublicReadAccess()) || true;
  const userHasAccess = deviceACL && deviceACL.getReadAccess(user.id);
  if (isPublic || userHasAccess) {
    key = device.get('key');
    if (!key) throw new Parse.Error(404, 'Device was found but key cannot be retrieved.');
  }
  return { key };
};

module.exports = {
  ping,
  flatAccount,
  findUsersByText,
  requestObjectPermissions,
  requestDeviceKey,
};