const { Parse } = global;
const { getQueryAuthOptions } = require('../utils');
const AccountService = require('../services/AccountService');

const requestObjectPermissions = async (className, objectId, user, master) => {
  if (!(className && objectId)) {
    throw new Parse.Error(400, 'Invalid Parameters: className and objectId should be provided');
  }
  const objectQuery = new Parse.Query(className);
  const queryOptions = getQueryAuthOptions(user, master);
  const object = await objectQuery.get(objectId, queryOptions);
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
        account: AccountService.flatAccount(account),
      };
    }
    return null;
  });

  const users = await Promise.all(promises);
  permissions.users = users.filter((u) => !!u);
  return { permissions };
};

// TODO: check if there is a need of control roles
const findUsersByText = async (text, user) => {
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
    const promises = result.map((u) => AccountService.findByUser(u, true));
    const results = await Promise.all(promises);
    return results.map((a) => AccountService.flatAccount(a));
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
  return result.map((a) => AccountService.flatAccount(a));
};

const findRolesByUser = async (user) => {
  const roles = await new Parse.Query(Parse.Role).equalTo('users', user).find();
  return roles;
};

const clearUserSessions = async (user) => {
  const query = new Parse.Query(Parse.Session);
  query.equalTo('user', user.toPointer());
  const sessions = await query.find({ useMasterKey: true });
  const promises = sessions.map((session) => session.destroy({ useMasterKey: true }));
  const sessionsCleared = await Promise.all(promises);
  return { sessions: sessionsCleared.map((s) => s.get('sessionToken')) };
};

module.exports = {
  requestObjectPermissions,
  findUsersByText,
  findRolesByUser,
  clearUserSessions,
};
