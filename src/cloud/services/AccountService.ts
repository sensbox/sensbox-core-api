import { getQueryAuthOptions } from '../utils';
import SecurityService from './SecurityService';

const findById = async (accountId: string): Promise<Parse.Object> => {
  const accountQuery = new Parse.Query('Account');
  return accountQuery.get(accountId);
};

const findByUser = (user: Parse.User, master: boolean): Promise<Parse.Object | undefined> => {
  const queryOptions = getQueryAuthOptions(user, master);
  const query = new Parse.Query('Account');
  query.include('user');
  query.equalTo('user', user);
  return query.first(queryOptions);
};

const setAccountToAdmin = async (account: Parse.Object, user: Parse.User) => {
  try {
    await SecurityService.ensureIsAdmin(user);
    const userOfAccount = account.get('user');
    if (userOfAccount) {
      const role = await SecurityService.getAdminRole();
      if (role) {
        role.getUsers().add(account.get('user'));
        role.save(null, { useMasterKey: true });
      }
    }
    return account;
  } catch (error) {
    throw new Error(error.message);
  }
};

const setAccountToBasic = async (account: Parse.Object, user: Parse.User) => {
  try {
    await SecurityService.ensureIsAdmin(user);
    const userOfAccount = account.get('user');
    if (userOfAccount) {
      const role = await SecurityService.getAdminRole();
      if (role) {
        role.getUsers().remove(account.get('user'));
        role.save(null, { useMasterKey: true });
      }
    }
    return account;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  findById,
  findByUser,
  setAccountToAdmin,
  setAccountToBasic,
};
