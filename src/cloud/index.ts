import { loadCloudFunctions, loadClassHooks } from './utils/loader';

const Influx = require('influx');

const influxDSN = process.env.INFLUX_DSN;
const InfluxDB = new Influx.InfluxDB(influxDSN);

// @ts-ignore
Parse.Integrations = {
  InfluxDB,
};

// Load triggers for each registered class
loadClassHooks();

const legacyMode = true;
loadCloudFunctions(legacyMode);

Parse.Cloud.beforeLogin(async (request: Parse.Cloud.TriggerRequest) => {
  const { object: user } = request;
  if (user.get('isBanned')) {
    throw new Error('Access denied, your account is disabled.');
  }
});
