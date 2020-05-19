import { loadCloudFunctions, loadClassHooks } from './utils/loader';
import SecurityService from './services/SecurityService';

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
  const { object: user, headers } = request;
  const { origin } = headers;
  try {
    if (origin && origin === process.env.SENSBOX_DASHBOARD_ORIGIN) {
      await SecurityService.ensureIsAdmin(<Parse.User>user);
    }
    if (user.get('isBanned')) {
      throw new Error('Access denied, your account is disabled.');
    }
  } catch (error) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, error.message);
  }
});
