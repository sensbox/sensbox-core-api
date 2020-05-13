import AccountService from '../services/AccountService';

const setAccountToAdmin = async (request: Sensbox.SecureFunctionRequest) => {
  const { user, params } = request;
  const { accountId } = params;
  const account = await AccountService.findById(accountId);
  return AccountService.setAccountToAdmin(account, user);
};

const setAccountToBasic = async (request: Sensbox.SecureFunctionRequest) => {
  const { user, params } = request;
  const { accountId } = params;
  const account = await AccountService.findById(accountId);
  return AccountService.setAccountToBasic(account, user);
};

export default {
  setAccountToAdmin,
  setAccountToBasic,
};
