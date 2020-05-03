const { DeviceService } = require('../services');

const findSensorsByDevices = async (request: Parse.Cloud.FunctionRequest) => {
  const { user, params } = request;
  const { devices } = <{ devices: { objectId: string }[]}>params;
  const devicesIds = devices.map((d) => d.objectId);
  const sensors = await DeviceService.findSensorsByDevicesIds(devicesIds, user);
  return {
    results: sensors,
  };
};

export default {
  findSensorsByDevices,
};
