const { Parse } = global;
const hat = require('hat');
const Base = require('./Base');

class Device extends Base {
  constructor() {
    super(Device.prototype.constructor.name);
  }

  static async beforeSave(request) {
    const { object, original } = request;
    await super.beforeSave(request);
    object.unset('sensors');
    // prevent query for uuid when not changed
    if (object.isNew() || object.get('uuid') !== original.get('uuid')) {
      const query = new Parse.Query(new Device());
      const uuid = request.object.get('uuid');
      query.equalTo('uuid', uuid);
      const result = await query.first({ useMasterKey: true });
      if (result && request.object.id !== result.id) {
        throw new Parse.Error(400, JSON.stringify({
          uuid: [`${uuid} is already registered.`],
        }));
      }

      if (request.object.isNew()) {
        const key = hat();
        request.object.set('key', key);
      }
    }
  }

  static async afterFind(request) {
    const { objects, master: isMaster } = request;

    // If no Devices, early return empty array
    if (objects.length === 0) return [];

    let response;
    // prevent fetch sensors when request isn't made from frontend
    if (isMaster) {
      response = objects;
    } else {
      const Sensor = Parse.Object.extend('Sensor');
      response = await Promise.all(objects.map(async (device) => {
        const query = new Parse.Query(new Sensor());
        query.equalTo('device', device);
        return query.find({ useMasterKey: true }).then((sensors) => device.set('sensors', sensors.map((s) => s.toJSON())));
      }));
    }
    return response;
  }

  static async afterSave(request) {
    const device = request.object;
    const Sensor = Parse.Object.extend('Sensor');
    const query = new Parse.Query(new Sensor());
    query.equalTo('device', device.toPointer());
    const sensors = await query.find({ useMasterKey: true });
    device.set('sensors', sensors.map((s) => s.toJSON()));
    return device;
  }
}

module.exports = Device;
