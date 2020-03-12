const { Parse } = global;
const Base = require('./Base');
const { UserService } = require('../services');

class Account extends Base {
  constructor() {
    super(Account.prototype.constructor.name);
  }

  static async beforeSave(request) {
    await super.beforeSave(request);
    try {
      const { object: account } = request;
      if (account.isNew()) {
        const firstName = account.get('firstName');
        const lastName = account.get('lastName');
        const email = account.get('email');
        const password = account.get('password');
        const isBanned = !account.get('active');
        const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
        const user = new Parse.User();
        user.setUsername(username);
        user.setPassword(password);
        user.setEmail(email);
        user.set('isBanned', isBanned);
        await user.save(null, { useMasterKey: true });
        account.set('user', user);
        const acl = account.getACL();
        acl.setWriteAccess(user, true);
        acl.setReadAccess(user, true);
        account.setACL(acl);
      } else {
        const user = account.get('user');
        const newPassword = account.get('password');
        const isBanned = !account.get('active');
        user.set('isBanned', isBanned);
        if (newPassword) {
          user.setPassword(newPassword);
        }
        await user.save(null, { useMasterKey: true });
        if (isBanned) await UserService.clearUserSessions(user);
      }

      account.unset('username');
      account.unset('password');
      account.unset('email');

      request.context = {
        accountUser: account.get('user'),
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      const { code, message: msg } = error;
      let message;
      switch (code) {
        case 202:
          message = {
            username: [msg],
          };
          break;
        case 203:
          message = {
            email: [msg],
          };
          break;
        default:
          message = {
            default: [msg],
          };
          break;
      }
      throw new Parse.Error(400, JSON.stringify(message));
    }
  }

  static async afterFind(request) {
    const { objects } = request;
    const promises = objects.map(async (account) => {
      const linkedUser = account.get('user');
      if (linkedUser) {
        try {
          const query = new Parse.Query(Parse.User);

          const user = await query.get(account.get('user').id, { useMasterKey: true });
          if (user) {
            account.set('username', user.getUsername());
            account.set('email', user.getEmail());
          }
        } catch (error) {
          account.set('username', 'User not found');
          account.set('email', 'User email not found');
        }
      }
      return account;
    });
    const response = await Promise.all(promises);
    return response;
  }

  static async afterSave(request) {
    const account = request.object;
    const { accountUser: user } = request.context;
    account.set('username', user.getUsername());
    account.set('email', user.getEmail());
    return account;
  }

  static async afterDelete(request) {
    const account = request.object;
    const user = account.get('user');
    await UserService.clearUserSessions(user);
    user.destroy({ useMasterKey: true });
  }
}

module.exports = Account;
