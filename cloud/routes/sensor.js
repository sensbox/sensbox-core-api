const { SensorController } = require('../controllers');

module.exports = {
  findSensorsByDevices: {
    action: SensorController.findSensorsByDevices,
    secure: true,
  },
};
