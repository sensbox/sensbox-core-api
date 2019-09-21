const Base = require('./Base');
const hat = require('hat');
class Sensor extends Base {

  constructor() {
    super(Sensor.prototype.constructor.name);
  }

  static async beforeSave(request){
    super.beforeSave(request);
    const query = new Parse.Query(new Sensor());
    const name = request.object.get("name");
    query.equalTo("name", name);
    query.equalTo("device", request.object.get("device"));
    const result = await query.first({ useMasterKey: true });
    if (result && request.object.id !== result.id) throw new Parse.Error(400, JSON.stringify({ 
      name: [`${name} is already registered.`]
    }));
  }

}

module.exports = Sensor;