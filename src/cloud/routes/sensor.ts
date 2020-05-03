const { SensorController } = require('../controllers');

const definitions: Sensbox.RouteDefinitions = {
  findSensorsByDevices: {
    action: SensorController.findSensorsByDevices,
    secure: true,
  },
};

export default definitions;