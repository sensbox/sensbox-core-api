/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */

import hat from 'hat';
import Base from './Base';

class Device extends Base {
  constructor() {
    super(Device.prototype.constructor.name);
  }

  static async beforeSave(request: Parse.Cloud.BeforeSaveRequest) {
    const { object, original } = request;
    await super.beforeSave(request);
    // prevent query for uuid when not changed
    if (object.isNew() || (original && original.get('uuid') !== object.get('uuid'))) {
      const query = new Parse.Query('Device');
      const uuid = request.object.get('uuid');
      query.equalTo('uuid', uuid);
      const result = await query.first({ useMasterKey: true });
      if (result && request.object.id !== result.id) {
        throw new Parse.Error(
          400,
          JSON.stringify({
            uuid: [`${uuid} is already registered.`],
          }),
        );
      }

      if (request.object.isNew()) {
        const key = hat();
        request.object.set('key', key);
      }
    }
  }

  static async afterFind(request: Parse.Cloud.AfterFindRequest) {
    const { objects, master: isMaster } = request;

    // If no Devices, early return empty array
    if (objects.length === 0) return [];

    let response;
    // prevent fetch sensors when request isn't made from frontend
    if (isMaster) {
      response = objects;
    } else {
      response = await Promise.all(
        objects.map(async (device) => {
          const query = new Parse.Query('Sensor');
          query.equalTo('device', device);
          const sensors = await query.find({ useMasterKey: true });
          return device.set(
            'sensors',
            sensors.map((s) => s.toJSON()),
          );
        }),
      );
    }
    return response;
  }

  static async afterSave(request: Parse.Cloud.AfterSaveRequest) {
    const device = request.object;
    const query = new Parse.Query('Sensor');
    query.equalTo('device', device.toPointer());
    const sensors = await query.find({ useMasterKey: true });
    device.set(
      'sensors',
      sensors.map((s) => s.toJSON()),
    );
    return device;
  }

  flat() {
    const flatted = this.toJSON();
    delete flatted.key;
    delete flatted.ACL;
    return flatted;
  }
}

export default Device;
