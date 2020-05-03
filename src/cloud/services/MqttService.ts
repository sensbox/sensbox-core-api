import DeviceService from './DeviceService';

const DEVICE_MESSAGE_TOPIC = 'agent/message';
const DEVICE_CONNECTED_TOPIC = 'agent/connected';
const DEVICE_DISCONNECTED_TOPIC = 'agent/disconnected';

const createMqttMessage = (uuid: string, topic: string, payload: object): Promise<Parse.Object> => {
  const MqttMessage = Parse.Object.extend('DeviceMessage');
  const mqttMessage = new MqttMessage();
  mqttMessage.set('uuid', uuid);
  mqttMessage.set('topic', topic);
  mqttMessage.set('payload', payload);
  mqttMessage.set('protocol', 'mqtt');
  // var acl = new Parse.ACL();
  // acl.setRoleReadAccess(ROLE_USER, true);
  // acl.setRoleReadAccess(ROLE_SUPER_ADMIN, true);
  // acl.setPublicReadAccess(false);
  // mqttMessage.setACL(acl);
  return mqttMessage.save(null, { useMasterKey: true });
};

const disconnectSensors = async (
  sensorsList: Parse.Object[],
  opts = { commitSave: true },
): Promise<Parse.Object[]> => {
  const options = { commitSave: true, ...opts };
  sensorsList.forEach((s) => s.set('connected', false));
  if (options.commitSave) {
    await Parse.Object.saveAll(sensorsList, { useMasterKey: true });
  }
  return sensorsList;
};

const setDeviceStatus = async (
  uuid: string,
  connected: boolean,
): Promise<{ connected: boolean; device: object }> => {
  // console.log(request.master);
  const device: Sensbox.Device = await DeviceService.findDeviceByUUID(uuid, undefined, true);
  device.set('connected', connected);

  const sensors = await DeviceService.findSensorsByDevice(device, undefined, true);

  const currentTime = new Date();
  if (connected) {
    device.set('connectedAt', currentTime);
    await createMqttMessage(uuid, DEVICE_CONNECTED_TOPIC, { agent: { uuid } });
  } else {
    device.set('disconnectedAt', currentTime);
    await createMqttMessage(uuid, DEVICE_DISCONNECTED_TOPIC, {
      agent: { uuid },
    });
    await disconnectSensors(sensors);
  }
  await device.save(null, { useMasterKey: true });
  return { connected, device: device.flat() };
};

const handlePayload = async (
  payload: Sensbox.MqttPayload,
): Promise<{ stored: boolean; device: object }> => {
  const { agent, metrics } = payload || {};
  const device = await DeviceService.findDeviceByUUID(agent.uuid, undefined, true);
  // If device is not connected return inmediatly
  if (!device.get('connected')) {
    throw new Parse.Error(500, 'Device is not connected. Please connect to server first.');
  }

  device.set('lastReportAt', new Date());
  device.set('connected', true);
  await device.save(null, { useMasterKey: true });
  await createMqttMessage(agent.uuid, DEVICE_MESSAGE_TOPIC, payload);

  const sensors = await DeviceService.findSensorsByDevice(device, undefined, true);
  await disconnectSensors(sensors, { commitSave: false });
  const postMetrics: Sensbox.InfluxWriteSchema[] = [];
  // Store Metrics
  // TODO: Verify is metric is registered for store

  metrics.forEach((metric) => {
    const sensor = sensors.find((s) => s.get('name') === metric.type);
    if (sensor) {
      sensor.set('connected', true);
      sensor.set('latestValue', metric.value.toString());
    }
    Parse.Object.saveAll(sensors, { useMasterKey: true });
    postMetrics.push({
      timestamp: metric.time,
      measurement: metric.type,
      tags: {
        host: agent.uuid,
        serie: metric.serie || null,
      },
      fields: { value: metric.value },
    });
  });

  // @ts-ignore
  const { InfluxDB } = Parse.Integrations;
  if (postMetrics.length) {
    try {
      await InfluxDB.writePoints(postMetrics, { precision: 'ms' });
    } catch (err) {
      throw new Parse.Error(500, err.message);
    }
  }

  return {
    stored: true,
    device: device.flat(),
  };
};

const authorizeClient = async (
  username: string,
  password: string,
): Promise<{ authorized: boolean; device: object }> => {
  if (username === undefined || password === undefined) {
    throw new Parse.Error(403, 'Username and Password have to be set.');
  }
  const query = new Parse.Query('Device');
  query.equalTo('uuid', username);
  query.equalTo('key', password);
  // eslint-disable-next-line keyword-spacing
  const device = <Sensbox.Device>await query.first({ useMasterKey: true });
  if (!device) throw new Parse.Error(403, 'Client unauthenticated. Bad Credentials');
  return { authorized: true, device: device.flat() };
};

export default {
  setDeviceStatus,
  disconnectSensors,
  createMqttMessage,
  handlePayload,
  authorizeClient,
};
