const clearSessionsFromUser = async (user) => {
  const query = new Parse.Query(Parse.Session);
  query.equalTo("user", user.toPointer());
  const sessions = await query.find({ useMasterKey: true });
  const promises = sessions.map(session => session.destroy({ useMasterKey: true }));
  const sessionsCleared = await Promise.all(promises);
  return { sessions: sessionsCleared };
}

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
  }
}

module.exports = {
  clearSessionsFromUser,
  secure,
}