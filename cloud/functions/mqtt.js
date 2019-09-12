const DEVICE_MESSAGE_TOPIC= 'agent/message';
const DEVICE_CONNECTED_TOPIC= 'agent/connected';
const DEVICE_DISCONNECTED_TOPIC= 'agent/disconnected';
const ROLE_USER = 'ROLE_USER';

const getFlatDevice = (device) => {
  const flatDevice = device.toJSON();
  delete flatDevice.key;
  delete flatDevice.ACL;
  return flatDevice;
}

const findDeviceByUUID = async (uuid) => {
  const Device = Parse.Object.extend("Device");
  const query = new Parse.Query(Device);
  query.equalTo("uuid", uuid);
  // query.equalTo("active", true);
  const device = await query.first({ useMasterKey: true });
  if (!device) throw new Parse.Error(404, `Device ${uuid} not found.`);
  return device;
}

const authorizeClient = async (request) => {
  const { username, password } = request.params;
  if (username === undefined || password === undefined) {
    throw new Parse.Error(403, "Username and Password have to be set.")
  }
  const Device = Parse.Object.extend("Device");
  const query = new Parse.Query(Device);
  query.equalTo("uuid", username);
  query.equalTo("key", password);
  const device = await query.first({ useMasterKey: true });
  if (!device) throw new Parse.Error(403, "Client unauthenticated. Bad Credentials");
  return { authorized: true, device: getFlatDevice(device) };
}


const setDeviceStatus = async (request, connected) => {
  const { uuid } = request.params;
  // console.log(request.master);
  const device = await findDeviceByUUID(uuid);
  device.set("connected", connected);
  const currentTime = new Date();
  if (connected) {
    device.set("connectedAt", currentTime);
  } else {
    device.set("disconnectedAt", currentTime);
  }
  await device.save(null, { useMasterKey: true });
  return { connected, device: getFlatDevice(device) };
}

const createMqttMessage = (uuid, topic, payload) => {
  const MqttMessage = Parse.Object.extend("DeviceMessage");
  const mqttMessage = new MqttMessage();
  mqttMessage.set("uuid", uuid);
  mqttMessage.set("topic", topic);
  mqttMessage.set("payload", payload);
  mqttMessage.set("protocol", 'mqtt');
  var roleACL = new Parse.ACL();
  roleACL.setRoleReadAccess(ROLE_USER, true);
  mqttMessage.setACL(roleACL);
  return mqttMessage.save(null, { useMasterKey: true });
}

const handlePayload = async (request, influx) => {
  const { payload } = request.params;
  const { agent, metrics } = payload ? payload : {};
  const device = await findDeviceByUUID(agent.uuid);
  device.set("lastReportAt", new Date());
  device.set("connected", true);
  await device.save(null, { useMasterKey: true });
  await createMqttMessage(agent.uuid, DEVICE_MESSAGE_TOPIC, payload);
  let postMetrics = []
  // Store Metrics
  // TODO: Verify is metric is registered for store
  for (let metric of metrics) {
    postMetrics.push({
      timestamp: metric.time,
      measurement: metric.type,
      tags: {
        host: agent.uuid,
        serie: metric.serie || null
      },
      fields: { value: metric.value }
    })
  }

  if (postMetrics.length) {
    try {
      await influx.writePoints(postMetrics, { precision: 'ms' })
    } catch (e) {
      throw new Parse.Error(500, err.message);
    }
  }

  return {
    stored: true,
    device: getFlatDevice(device)
  }
}

module.exports = {
  authorizeClient,
  setDeviceStatus,
  handlePayload
}