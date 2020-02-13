const { Parse } = global;
const Influx = require('influx');

// eslint-disable-next-line object-curly-newline
const { Dashboard, Device, Organization, Zone, Account, Sensor } = require('./classes');
const { Common, Mqtt, Influx: InfluxFn, Sensor: SensorFn } = require('./functions');

// const { secure } = require('./utils');

const influxDSN = process.env.INFLUX_DSN;
const InfluxDB = new Influx.InfluxDB(influxDSN);

Parse.Integrations = {
  InfluxDB,
};

Parse.Cloud.beforeLogin(async (request) => {
  const { object: user } = request;
  if (user.get('isBanned')) {
    throw new Error('Access denied, your account is disabled.');
  }
});

// Before Save Triggers
Parse.Cloud.beforeSave('Device', Device.beforeSave);
Parse.Cloud.beforeSave('Organization', Organization.beforeSave);
Parse.Cloud.beforeSave('Zone', Zone.beforeSave);
Parse.Cloud.beforeSave('Sensor', Sensor.beforeSave);
Parse.Cloud.beforeSave('Account', Account.beforeSave);
Parse.Cloud.beforeSave('Dashboard', Dashboard.beforeSave);

// After Save Triggers
Parse.Cloud.afterSave('Account', Account.afterSave);
Parse.Cloud.afterSave('Device', Device.afterSave);

// Before Delete Triggers
Parse.Cloud.beforeDelete('Account', Account.beforeDelete);
Parse.Cloud.beforeDelete('Organization', Organization.beforeDelete);

// After Delete Triggers
Parse.Cloud.afterDelete('Account', Account.afterDelete);
Parse.Cloud.afterDelete('Organization', Organization.afterDelete);

// Before Find Triggers
// Parse.Cloud.beforeFind('Organization', Organization.beforeFind);

// After Find Triggers
Parse.Cloud.afterFind('Account', Account.afterFind);
Parse.Cloud.afterFind('Device', Device.afterFind);

// Common Cloud Functions
Parse.Cloud.define('ping', Common.ping);
Parse.Cloud.define('findUsersByText', Common.findUsersByText);
Parse.Cloud.define('requestObjectPermissions', Common.requestObjectPermissions);

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
