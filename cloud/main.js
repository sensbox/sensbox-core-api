const Influx = require('influx');

const Device = require('./classes/Device');
const Organization = require('./classes/Organization');
const Zone = require('./classes/Zone');
const common = require('./functions/common');
const mqtt = require('./functions/mqtt');

const influxDSN = process.env.INFLUX_DSN;
const InfluxDB = new Influx.InfluxDB(influxDSN);

Parse.Integrations = {
  InfluxDB,
}

// Before Save Triggers
Parse.Cloud.beforeSave("Device", Device.beforeSave);
Parse.Cloud.beforeSave("Organization", Organization.beforeSave);
Parse.Cloud.beforeSave("Zone", Zone.beforeSave);

// After Save Triggers
// Parse.Cloud.afterSave("Centro", async (request) => Centro.afterSave(request));

// After Find Triggers


// Common Cloud Functions
Parse.Cloud.define('ping', common.ping);


// Mqtt Cloud functions
Parse.Cloud.define('mqttAuthorizeClient', mqtt.authorizeClient);
Parse.Cloud.define('mqttConnectDevice', (request) => mqtt.setDeviceStatus(request, true));
Parse.Cloud.define('mqttDisconnectDevice', (request) => mqtt.setDeviceStatus(request, false));
Parse.Cloud.define('mqttHandlePayload', mqtt.handlePayload);
