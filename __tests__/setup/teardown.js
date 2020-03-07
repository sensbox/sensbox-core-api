module.exports = async (Parse, user, mongoStorageAdapter) => {
  const accountsQuery = new Parse.Query('Account').equalTo('user', user);
  const accounts = await accountsQuery.find({ useMasterKey: true });
  if (accounts.length) {
    await Promise.all(accounts.map((acc) => acc.destroy({ useMasterKey: true })));
  }
  try {
    await Parse.User.logOut();
  } catch (error) {
    console.log(error);
  }

  // It's not neccesary because exists an afterDelete trigger in Account that delete the user
  // await user.destroy({ useMasterKey: true });

  mongoStorageAdapter.handleShutdown();
};
