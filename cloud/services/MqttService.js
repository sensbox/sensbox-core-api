const { Parse } = global;
const { findDeviceByUUID, flatDevice, findSensorsByDevice } = require('../services/DeviceService');

const DEVICE_MESSAGE_TOPIC = 'agent/message';
const DEVICE_CONNECTED_TOPIC = 'agent/connected';
const DEVICE_DISCONNECTED_TOPIC = 'agent/disconnected';

const createMqttMessage = (uuid, topic, payload) => {
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

const disconnectSensors = async (sensorsList, opts) => {
  const options = { commitSave: true, ...opts };
  sensorsList.forEach((s) => s.set('connected', false));
  if (options.commitSave) {
    await Parse.Object.saveAll(sensorsList, { useMasterKey: true });
  }
  return sensorsList;
};

const setDeviceStatus = async (uuid, connected) => {
  // console.log(request.master);
  const device = await findDeviceByUUID(uuid, null, true);
  device.set('connected', connected);

  const sensors = await findSensorsByDevice(device, null, true);

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
  return { connected, device: flatDevice(device) };
};

const handlePayload = async (payload) => {
  const { agent, metrics } = payload || {};
  const device = await findDeviceByUUID(agent.uuid, null, true);
  // If device is not connected return inmediatly
  if (!device.get('connected')) {
    throw new Parse.Error(500, 'Device is not connected. Please connect to server first.');
  }

  device.set('lastReportAt', new Date());
  device.set('connected', true);
  await device.save(null, { useMasterKey: true });
  await createMqttMessage(agent.uuid, DEVICE_MESSAGE_TOPIC, payload);

  const sensors = await findSensorsByDevice(device, null, true);
  await disconnectSensors(sensors, { commitSave: false });
  const postMetrics = [];
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
    device: flatDevice(device),
  };
};

const authorizeClient = async (username, password) => {
  if (username === undefined || password === undefined) {
    throw new Parse.Error(403, 'Username and Password have to be set.');
  }
  const query = new Parse.Query('Device');
  query.equalTo('uuid', username);
  query.equalTo('key', password);
  const device = await query.first({ useMasterKey: true });
  if (!device) throw new Parse.Error(403, 'Client unauthenticated. Bad Credentials');
  return { authorized: true, device: flatDevice(device) };
};

module.exports = {
  setDeviceStatus,
  disconnectSensors,
  createMqttMessage,
  handlePayload,
  authorizeClient,
};