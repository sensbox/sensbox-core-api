const { DefaultController } = require('../controllers');

module.exports = {
  ping: {
    action: DefaultController.ping,
    secure: false,
  },
  findUsersByText: {
    action: DefaultController.findUsersByText,
    secure: true,
  },
  requestObjectPermissions: {
    action: DefaultController.requestObjectPermissions,
    secure: true,
  },
  requestDeviceKey: {
    action: DefaultController.requestDeviceKey,
    secure: true,
  },
};
