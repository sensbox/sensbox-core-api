const { Parse } = global;
const passwordCrypto = require('parse-server/lib/password');
const { getDatabaseInstance } = require('../utils/core');
const { getArraysIntersection, getQueryAuthOptions } = require('../utils');

const findDeviceById = (deviceId, user, master) => {
  const query = new Parse.Query('Device');
  const queryOptions = getQueryAuthOptions(user, master);
  return query.get(deviceId, queryOptions);
};

const findDevicesById = (devices, user, master) => {
  const queryOptions = getQueryAuthOptions(user, master);
  const promises = devices.map((deviceId) => findDeviceById(deviceId, queryOptions));
  return Promise.all(promises);
};

const findDeviceByUUID = async (uuid, user, master) => {
  const queryOptions = getQueryAuthOptions(user, master);
  const query = new Parse.Query('Device');
  query.equalTo('uuid', uuid);
  // query.equalTo("active", true);
  const device = await query.first(queryOptions);
  if (!device) throw new Parse.Error(404, `Device ${uuid} not found.`);
  return device;
};

const findSensorsByDevicesIds = async (devicesIds, user, master) => {
  const queryOptions = getQueryAuthOptions(user, master);
  const results = await findDevicesById(devicesIds, queryOptions);
  let sensors = [];
  const intersection = devicesIds.length > 1;
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
  return sensors;
};

const findSensorsByDevice = async (device, user, master) => {
  const queryOptions = getQueryAuthOptions(user, master);
  const Sensor = Parse.Object.extend('Sensor');
  const query = new Parse.Query(Sensor);
  query.equalTo('device', device.toPointer());
  return query.find(queryOptions);
};

const requestDeviceKey = async (uuid, password, user) => {
  const database = getDatabaseInstance();
  const userCollection = database.collection('_User');
  const currentUser = await userCollection.findOne({
    _id: user.id,
  });
  // eslint-disable-next-line no-underscore-dangle
  const passwordsMatch = await passwordCrypto.compare(password, currentUser._hashed_password);
  if (!passwordsMatch) throw new Parse.Error(403, 'Bad Password');

  const device = await findDeviceByUUID(uuid, null, true);
  let key = null;
  const deviceACL = device.getACL();
  const isPublic = (deviceACL && deviceACL.getPublicReadAccess()) || true;
  const userHasAccess = deviceACL && deviceACL.getReadAccess(user.id);
  if (isPublic || userHasAccess) {
    key = device.get('key');
    if (!key) throw new Parse.Error(404, 'Device was found but key cannot be retrieved.');
  }
  return { key };
};

module.exports = {
  findDeviceById,
  findDevicesById,
  findDeviceByUUID,
  findSensorsByDevice,
  findSensorsByDevicesIds,
  requestDeviceKey,
};
