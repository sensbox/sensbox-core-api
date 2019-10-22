const Influx = require('influx');

const { Dashboard, Device, Organization, Zone, Account, Sensor} = require('./classes');

// const { secure } = require('./utils');
const common = require('./functions/common');
const mqtt = require('./functions/mqtt');
const influx = require('./functions/influx');
const influxDSN = process.env.INFLUX_DSN;
const InfluxDB = new Influx.InfluxDB(influxDSN);

Parse.Integrations = {
  InfluxDB,
}

Parse.Cloud.beforeLogin(async request => {
  const { object: user }  = request;
  if(user.get('isBanned')) {
   throw new Error('Access denied, your account is disabled.');
  }
});

// Before Save Triggers
Parse.Cloud.beforeSave("Device", Device.beforeSave);
Parse.Cloud.beforeSave("Organization", Organization.beforeSave);
Parse.Cloud.beforeSave("Zone", Zone.beforeSave);
Parse.Cloud.beforeSave("Sensor", Sensor.beforeSave);
Parse.Cloud.beforeSave("Account", Account.beforeSave);
Parse.Cloud.beforeSave("Dashboard", Dashboard.beforeSave);

// After Save Triggers
Parse.Cloud.afterSave("Account", Account.afterSave);
Parse.Cloud.afterSave("Device", Device.afterSave);

// Before Delete Triggers
Parse.Cloud.beforeDelete("Account", Account.beforeDelete);
Parse.Cloud.beforeDelete("Organization", Organization.beforeDelete);

// After Delete Triggers
Parse.Cloud.afterDelete("Account", Account.afterDelete);
Parse.Cloud.afterDelete("Organization", Organization.afterDelete);

// Before Find Triggers
// Parse.Cloud.beforeFind('Organization', Organization.beforeFind);

// After Find Triggers
Parse.Cloud.afterFind('Account', Account.afterFind);
Parse.Cloud.afterFind('Device', Device.afterFind);

// Common Cloud Functions
Parse.Cloud.define('ping', common.ping);
Parse.Cloud.define('findUsersByText', common.findUsersByText);
Parse.Cloud.define('requestObjectPermissions', common.requestObjectPermissions);
Parse.Cloud.define('storeFetch', influx.fetch);

// Mqtt Cloud functions
Parse.Cloud.define('mqttAuthorizeClient', mqtt.authorizeClient);
Parse.Cloud.define('mqttConnectDevice', (request) => mqtt.setDeviceStatus(request, true));
Parse.Cloud.define('mqttDisconnectDevice', (request) => mqtt.setDeviceStatus(request, false));
Parse.Cloud.define('mqttHandlePayload', mqtt.handlePayload);
