const createTestAccount = async (Parse, firstName = 'jest') => {
  const time = process
    .hrtime()
    .toString()
    .replace(',', '');
  const account = new Parse.Object('Account');
  // const password = 'securePass';
  account.set('firstName', firstName);
  account.set('lastName', time);
  account.set('active', true);
  account.set('email', `test_${time}@test.com`);
  account.set('password', 'securePass');
  await account.save(null, { useMasterKey: true });
  // console.log(account);
  return {
    account,
  };
};

module.exports = {
  createTestAccount,
};
