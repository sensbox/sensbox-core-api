const { Parse } = global;

const clearSessionsFromUser = async (user) => {
  const query = new Parse.Query(Parse.Session);
  query.equalTo('user', user.toPointer());
  const sessions = await query.find({ useMasterKey: true });
  const promises = sessions.map((session) => session.destroy({ useMasterKey: true }));
  const sessionsCleared = await Promise.all(promises);
  return { sessions: sessionsCleared };
};

/**
 * Decorator function to apply to all functions that needs to check for user authentication
 * @param {*} callback
 */
function secure(callback) {
  return (request) => {
    const { master: isMaster, user } = request;
    if (!isMaster) {
      if (!user) throw new Parse.Error(403, '{"error":"unauthorized"}');
    }
    return callback.call(this, request);
  };
}

function getArraysIntersection(list1, list2, ...otherLists) {
  const result = [];

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
  secure,
  getArraysIntersection,
  nullParser,
};
