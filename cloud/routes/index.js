const defaultRoutes = require('./default');
const influx = require('./influx');
const mqtt = require('./mqtt');
const sensor = require('./sensor');

module.exports = {
  default: defaultRoutes,
  influx,
  mqtt,
  sensor,
};
