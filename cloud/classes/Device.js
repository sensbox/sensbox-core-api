const escape = require('escape-html');
const Base = require('./Base');
const hat = require('hat');
class Device extends Base {

  constructor() {
    const CLASS_NAME = "Device";
    super(CLASS_NAME);
  }

  static async beforeSave(request){
    super.beforeSave(request);
    const query = new Parse.Query(new Device());
    const uuid = request.object.get("uuid");
    query.equalTo("uuid", uuid);
    const result = await query.first({ useMasterKey: true });
    if (result && request.object.id !== result.id) throw new Parse.Error(400, JSON.stringify({ 
      uuid: [`${uuid} is already registered.`]
    }));
    const key = hat();
    if (request.object.isNew()) {
      request.object.set("key", key);
    }
  }

  static async afterSave(request){
    // const centro = request.object;
    // const Investigador = Parse.Object.extend("Investigador");
    // const query = new Parse.Query(new Investigador());
    // query.equalTo("centro", centro);
    // const investigadores = await query.find({ useMasterKey: true });
    // investigadores.forEach((investigador) => { 
    //   investigador.set("centro", centro);
    //   investigador.save();
    // });
  }

}

module.exports = Device;