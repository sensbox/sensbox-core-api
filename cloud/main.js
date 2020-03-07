const { Parse } = global;
const Influx = require('influx');
const { loadClassHooks, loadCloudFunctions } = require('./utils/core');

const influxDSN = process.env.INFLUX_DSN;
const InfluxDB = new Influx.InfluxDB(influxDSN);

Parse.Integrations = {
  InfluxDB,
};

// Load triggers for each registered class
loadClassHooks();

const legacyMode = true;
loadCloudFunctions(legacyMode);

Parse.Cloud.beforeLogin(async (request) => {
  const { object: user } = request;
  if (user.get('isBanned')) {
    throw new Error('Access denied, your account is disabled.');
  }
});
