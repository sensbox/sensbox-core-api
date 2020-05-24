import { DeviceController } from '../controllers';

const definitions: Sensbox.RouteDefinitions = {
  enableReadPermissionToDeviceToUser: {
    action: DeviceController.enableReadPermissionToUser,
    secure: true,
  },
};

export default definitions;
