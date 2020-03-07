const { MqttController } = require('../controllers');

module.exports = {
  mqttAuthorizeClient: {
    action: MqttController.authorizeClient,
    secure: false,
  },
  mqttConnectDevice: {
    action: MqttController.connectDevice,
    secure: false,
  },
  mqttDisconnectDevice: {
    action: MqttController.disconnectDevice,
    secure: false,
  },
  mqttHandlePayload: {
    action: MqttController.handlePayload,
    secure: false,
  },
};
