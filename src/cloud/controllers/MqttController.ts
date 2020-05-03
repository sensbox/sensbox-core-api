const { MqttService } = require('../services');

const authorizeClient = async (request: Parse.Cloud.FunctionRequest) => {
  const { username, password } = request.params;
  return MqttService.authorizeClient(username, password);
};

const connectDevice = async (request: Parse.Cloud.FunctionRequest) => {
  const { params } = request;
  const { uuid } = params;
  return MqttService.setDeviceStatus(uuid, true);
};

const disconnectDevice = async (request: Parse.Cloud.FunctionRequest) => {
  const { params } = request;
  const { uuid } = params;
  return MqttService.setDeviceStatus(uuid, false);
};

const handlePayload = async (request: Parse.Cloud.FunctionRequest) => {
  const { payload } = request.params;
  return MqttService.handlePayload(payload);
};

export default {
  connectDevice,
  disconnectDevice,
  handlePayload,
  authorizeClient,
};
