const { Parse } = global;
const Config = require('parse-server/lib/Config');

function getDatabaseInstance() {
  const config = Config.get(Parse.applicationId);
  const { database } = config.database.adapter;
  return database;
}

module.exports = {
  getDatabaseInstance,
};
