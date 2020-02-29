const { Parse } = global;

const clearSessionsFromUser = async (user) => {
  const query = new Parse.Query(Parse.Session);
  query.equalTo('user', user.toPointer());
  const sessions = await query.find({ useMasterKey: true });
  const promises = sessions.map((session) => session.destroy({ useMasterKey: true }));
  const sessionsCleared = await Promise.all(promises);
  return { sessions: sessionsCleared.map((s) => s.get('sessionToken')) };
};

const getUserRoles = async (user) => {
  const roles = await new Parse.Query(Parse.Role).equalTo('users', user).find();
  return roles;
};

function getArraysIntersection(list1, list2, ...otherLists) {
  const result = [];
  if (arguments.length === 0) {
    throw new Error('getArraysIntersection cannot be called with no arguments');
  }
  if (!list2) return result;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < list1.length; i++) {
    const item1 = list1[i];
    let found = false;
    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < list2.length && !found; j++) {
      found = JSON.stringify(item1) === JSON.stringify(list2[j]);
    }
    if (found === true) {
      result.push(item1);
    }
  }

  return otherLists.length
    ? getArraysIntersection(result, otherLists.shift(), ...otherLists)
    : result;
}

const nullParser = (opt) => {
  if (opt === 'null') {
    return null;
  }
  return opt;
};

module.exports = {
  clearSessionsFromUser,
  getUserRoles,
  getArraysIntersection,
  nullParser,
};
