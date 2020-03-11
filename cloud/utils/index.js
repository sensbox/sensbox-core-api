const { Parse } = global;

/**
 * Decorator function to apply to all functions that needs to check for user authentication
 * @param {*} callback
 */
function secure(callback) {
  return (request) => {
    const { master: isMaster, user } = request;
    if (!isMaster && !user) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User needs to be authenticated');
    }
    return callback.call(this, request);
  };
}

const getQueryAuthOptions = (user, master = false) => {
  const options = master ? { useMasterKey: true } : { sessionToken: user.getSessionToken() };
  return options;
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

const generateRandomData = () => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 100; i += 1) {
    const y = Math.floor(Math.random() * (100 - 50 + 1) + 50);
    data.push({
      x: today.getTime() - i * 60000000,
      y,
    });
  }
  return data;
};

module.exports = {
  getArraysIntersection,
  nullParser,
  generateRandomData,
  secure,
  getQueryAuthOptions,
};
