import { getDatabaseInstance } from '../utils/core';
import { getArraysIntersection, getQueryAuthOptions } from '../utils';

const passwordCrypto = require('parse-server/lib/password');

const findDeviceById = (
  deviceId: string,
  user: Parse.User,
  master: boolean,
): Promise<Parse.Object> => {
  const query = new Parse.Query('Device');
  const queryOptions = getQueryAuthOptions(user, master);
  return query.get(deviceId, queryOptions);
};

const findDevicesById = async (
  devicesIds: string[],
  user: Parse.User,
  master: boolean,
): Promise<Parse.Object[]> => {
  const devices = await Promise.all(
    devicesIds.map((deviceId) => findDeviceById(deviceId, user, master)),
  );
  return devices;
};

const findDeviceByUUID = async (
  uuid: string,
  user: Parse.User | undefined,
  master: boolean,
): Promise<Sensbox.Device> => {
  const queryOptions = getQueryAuthOptions(user, master);
  const query = new Parse.Query('Device');
  query.equalTo('uuid', uuid);
  // query.equalTo("active", true);
  // eslint-disable-next-line keyword-spacing
  const device = <Sensbox.Device>await query.first(queryOptions);
  if (!device) throw new Parse.Error(404, `Device ${uuid} not found.`);
  return device;
};

const findSensorsByDevicesIds = async (
  devicesIds: string[],
  user: Parse.User,
  master: boolean,
): Promise<any> => {
  const results = await findDevicesById(devicesIds, user, master);
  let sensors: any[] = [];
  const intersection = devicesIds.length > 1;
  if (!intersection) {
    results.forEach((device) => {
      const deviceSensors = device.get('sensors');
      sensors = [...sensors, ...deviceSensors];
    });
  } else {
    const sensorsList = results.map((device) => {
      const deviceSensors = device.get('sensors');
      return deviceSensors.map((sensor: any) => ({ name: sensor.name }));
    });
    // @ts-ignore
    sensors = getArraysIntersection(...sensorsList).map((sensor: any) => ({
      objectId: 'mix',
      name: sensor.name,
    }));
  }
  return sensors;
};

const findSensorsByDevice = async (
  device: Parse.Object,
  user: Parse.User | undefined,
  master: boolean = false,
): Promise<Parse.Object[]> => {
  const queryOptions = getQueryAuthOptions(user, master);
  const query = new Parse.Query('Sensor');
  query.equalTo('device', device);
  return query.find(queryOptions);
};

const requestDeviceKey = async (
  uuid: string,
  password: string,
  user: Parse.User,
): Promise<{ key: string }> => {
  const database = getDatabaseInstance();
  const userCollection = database.collection('_User');
  const currentUser = await userCollection.findOne({
    _id: user.id,
  });
  // eslint-disable-next-line no-underscore-dangle
  const passwordsMatch = await passwordCrypto.compare(password, currentUser._hashed_password);
  if (!passwordsMatch) throw new Parse.Error(403, 'Bad Password');

  const device = await findDeviceByUUID(uuid, undefined, true);
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

const enableReadPermissionToUser = async (
  uuid: string,
  user: Parse.User,
): Promise<Parse.Object> => {
  try {
    const device = await new Parse.Query('Device')
      .equalTo('uuid', uuid)
      .first({ useMasterKey: true });
    if (!device) throw new Error(`Cannot find device uuid: ${uuid}`);
    const acl = device.getACL();
    if (acl) {
      acl.setReadAccess(user, true);
      device.setACL(acl);
      device.save(null, { useMasterKey: true });
    }
    return device;
  } catch (error) {
    throw new Error(`Cannot enable read access to device ${uuid}. Detail: ${error.message}`);
  }
};

export default {
  findDeviceById,
  findDevicesById,
  findDeviceByUUID,
  findSensorsByDevice,
  findSensorsByDevicesIds,
  requestDeviceKey,
  enableReadPermissionToUser,
};
