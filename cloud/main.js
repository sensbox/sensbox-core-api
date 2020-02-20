const { Parse } = global;
const { AppCache } = require('parse-server/lib/cache'); // this refrenese only in cloud cloud
const Influx = require('influx');
const { loadTriggers, registerClasses } = require('./utils/core');

// eslint-disable-next-line object-curly-newline
const { Dashboard, Device, Organization, Zone, Account, Sensor } = require('./classes');
const { Common, Mqtt, Influx: InfluxFn, Sensor: SensorFn } = require('./functions');

// const { secure } = require('./utils');

const influxDSN = process.env.INFLUX_DSN;
const InfluxDB = new Influx.InfluxDB(influxDSN);

Parse.Integrations = {
  InfluxDB,
};

const app = AppCache.get(process.env.APP_ID);
Parse.dbAdapter = app.databaseController.adapter;

Parse.Cloud.beforeLogin(async (request) => {
  const { object: user } = request;
  if (user.get('isBanned')) {
    throw new Error('Access denied, your account is disabled.');
  }
});

registerClasses(Dashboard, Device, Organization, Zone, Account, Sensor);

// Load triggers for each registered class
loadTriggers();

// Common Cloud Functions
Parse.Cloud.define('ping', Common.ping);
Parse.Cloud.define('findUsersByText', Common.findUsersByText);
Parse.Cloud.define('requestObjectPermissions', Common.requestObjectPermissions);
Parse.Cloud.define('requestDeviceKey', Common.requestDeviceKey);

// Sensors Cloud Functions
Parse.Cloud.define('findSensorsByDevices', SensorFn.findSensorsByDevices);

// Influx Cloud Functions
Parse.Cloud.define('metricsStoreFetch', InfluxFn.fetch);
Parse.Cloud.define('metricsStoreFetchSeries', InfluxFn.fetchSeries);

// Mqtt Cloud functions
Parse.Cloud.define('mqttAuthorizeClient', Mqtt.authorizeClient);
Parse.Cloud.define('mqttConnectDevice', (request) => Mqtt.setDeviceStatus(request, true));
Parse.Cloud.define('mqttDisconnectDevice', (request) => Mqtt.setDeviceStatus(request, false));
Parse.Cloud.define('mqttHandlePayload', Mqtt.handlePayload);
