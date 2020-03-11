const { UserService, DeviceService } = require('../services');

const ping = () => ({
  msg: 'pong',
  time: new Date(),
});

// TODO: check if there is a need of control roles
const findUsersByText = async (request) => {
  const { user, params } = request;
  const { text } = params;
  return UserService.findUsersByText(text, user);
};

const requestObjectPermissions = async (request) => {
  const { user, master, params } = request;
  const { className, objectId } = params;
  return UserService.requestObjectPermissions(className, objectId, user, master);
};

const requestDeviceKey = async (request) => {
  const { user, params } = request;
  const { uuid, password } = params;
  return DeviceService.requestDeviceKey(uuid, password, user);
};

module.exports = {
  ping,
  findUsersByText,
  requestObjectPermissions,
  requestDeviceKey,
};
