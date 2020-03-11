const { MqttService } = require('../services');

const authorizeClient = async (request) => {
  const { username, password } = request.params;
  return MqttService.authorizeClient(username, password);
};

const connectDevice = async (request) => {
  const { params } = request;
  const { uuid } = params;
  return MqttService.setDeviceStatus(uuid, true);
};

const disconnectDevice = async (request) => {
  const { params } = request;
  const { uuid } = params;
  return MqttService.setDeviceStatus(uuid, false);
};

const handlePayload = async (request) => {
  const { payload } = request.params;
  return MqttService.handlePayload(payload);
};

module.exports = {
  connectDevice,
  disconnectDevice,
  handlePayload,
  authorizeClient,
};
