const { DeviceService } = require('../services/');

const findSensorsByDevices = async (request) => {
  const { user, params } = request;
  const { devices } = params;
  const devicesIds = devices.map((d) => d.objectId);
  const sensors = await DeviceService.findSensorsByDevicesIds(devicesIds, user);
  return {
    results: sensors,
  };
};

module.exports = {
  findSensorsByDevices,
};
