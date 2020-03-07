/* eslint-disable class-methods-use-this */
const { Parse } = global;
const { getArraysIntersection } = require('../utils');

const findSensorsByDevices = async (request) => {
  const { user, params } = request;
  const { devices } = params;

  const promises = devices.map((device) => {
    const query = new Parse.Query('Device');
    query.equalTo('objectId', device.objectId);
    return query.first({ sessionToken: user.getSessionToken() });
  });

  let sensors = [];
  const results = await Promise.all(promises);
  const intersection = devices.length > 1;
  if (!intersection) {
    results.forEach((device) => {
      const deviceSensors = device.get('sensors');
      sensors = [...sensors, ...deviceSensors];
    });
  } else {
    const sensorsList = results.map((device) => {
      const deviceSensors = device.get('sensors');
      return deviceSensors.map((sensor) => ({ name: sensor.name }));
    });
    sensors = getArraysIntersection(...sensorsList).map((sensor) => ({
      objectId: 'mix',
      name: sensor.name,
    }));
  }
  return {
    results: sensors,
  };
};

module.exports = {
  findSensorsByDevices,
};
