const { Parse, testUser } = global;

describe('Account Class Tests', () => {
  test('Should get only my account', async () => {
    const query = new Parse.Query('Account');
    const accounts = await query.find({ sessionToken: testUser.getSessionToken() });
    expect(accounts.length).toBe(1);
    expect(accounts[0].get('user')._getId()).toBe(testUser._getId());
  });
});
