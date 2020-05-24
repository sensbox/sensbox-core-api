import DeviceService from '../services/DeviceService';

const enableReadPermissionToUser = async (request: Sensbox.SecureFunctionRequest) => {
  const { user, params } = request;
  const { uuid } = params;
  return DeviceService.enableReadPermissionToUser(uuid, user);
};

export default {
  enableReadPermissionToUser,
};
