const createTestAccount = async (Parse, firstName = 'jest', username) => {
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
  if (username) {
    const user = account.get('user');
    user.set('username', username);
    await user.save(null, { useMasterKey: true });
  }
  // console.log(account);
  return account;
};

const registerClasses = () => {
  const { Parse } = global;
  // eslint-disable-next-line global-require
  const classes = require('../../cloud/classes');
  const classesArray = Object.keys(classes).map((key) => classes[key]);

  classesArray.forEach((c) => {
    Parse.Object.registerSubclass(c.name, c);
  });
};

module.exports = {
  createTestAccount,
  registerClasses,
};
