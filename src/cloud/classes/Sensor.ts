
import Base from './Base';

class Sensor extends Base {
  constructor() {
    super(Sensor.prototype.constructor.name);
  }

  static async beforeSave(request: Parse.Cloud.BeforeSaveRequest) {
    const { object, original } = request;
    await super.beforeSave(request);
    if (original) {
      // prevent query for name when not changed
      if (object.isNew() || object.get('name') !== original.get('name')) {
        const query = new Parse.Query('Sensor');
        const name = object.get('name');
        query.equalTo('name', name);
        query.equalTo('device', object.get('device'));
        const result = await query.first({ useMasterKey: true });
        if (result && object.id !== result.id) {
          throw new Parse.Error(
            400,
            JSON.stringify({
              name: [`${name} is already registered.`],
            }),
          );
        }
      }
    }
  }
}

export default Sensor;
