const Influx = require('influx');

const Device = require('./classes/Device');
const common = require('./functions/common');
const mqtt = require('./functions/mqtt');

const influxDSN = process.env.INFLUX_DSN;

const influx = new Influx.InfluxDB(influxDSN);

// Before Save Triggers
Parse.Cloud.beforeSave("Device", async (request) => Device.beforeSave(request));

// After Save Triggers
// Parse.Cloud.afterSave("Centro", async (request) => Centro.afterSave(request));

// After Find Triggers


// Common Cloud Functions
Parse.Cloud.define('ping', common.ping);


// Mqtt Cloud functions
Parse.Cloud.define('mqttAuthorizeClient', mqtt.authorizeClient);
Parse.Cloud.define('mqttConnectDevice', (request) => mqtt.setDeviceStatus(request, true));
Parse.Cloud.define('mqttDisconnectDevice', (request) => mqtt.setDeviceStatus(request, false));
Parse.Cloud.define('mqttHandlePayload', (request) => mqtt.handlePayload(request, influx));
