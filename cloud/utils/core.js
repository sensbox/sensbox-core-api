const { Parse } = global;
const Config = require('parse-server/lib/Config');

const classes = [];

function registerClasses(...args) {
  args.forEach((c) => classes.push(c));
}

function loadTriggers() {
  classes.forEach((c) => {
    Parse.Cloud.beforeSave(c.name, c.beforeSave);
    Parse.Cloud.afterSave(c.name, c.afterSave);
    Parse.Cloud.beforeDelete(c.name, c.beforeDelete);
    Parse.Cloud.afterDelete(c.name, c.afterDelete);
    Parse.Cloud.beforeFind(c.name, c.beforeFind);
    Parse.Cloud.beforeFind(c.name, c.beforeFind);
    Parse.Cloud.afterFind(c.name, c.afterFind);
  });
}

function getDatabaseInstance() {
  const config = Config.get(Parse.applicationId);
  const { database } = config.database.adapter;
  return database;
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
  };
}

module.exports = {
  registerClasses,
  loadTriggers,
  getDatabaseInstance,
  secure,
};
