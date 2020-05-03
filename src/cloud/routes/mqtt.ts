import { MqttController } from '../controllers';

const definitions: Sensbox.RouteDefinitions = {
  mqttAuthorizeClient: {
    action: MqttController.authorizeClient,
    secure: true,
    onlyMaster: true,
  },
  mqttConnectDevice: {
    action: MqttController.connectDevice,
    secure: false,
    onlyMaster: true,
  },
  mqttDisconnectDevice: {
    action: MqttController.disconnectDevice,
    secure: false,
    onlyMaster: true,
  },
  mqttHandlePayload: {
    action: MqttController.handlePayload,
    secure: false,
    onlyMaster: true,
  },
};

export default definitions;
