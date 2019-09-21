const Base = require('./Base');
const hat = require('hat');
class Device extends Base {

  constructor() {
    super(Device.prototype.constructor.name);
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

  static async afterFind(request){
    const { objects } = request;
    
    // If no Devices, early return empty array 
    if (objects.length === 0 ) return [];

    const Sensor = Parse.Object.extend("Sensor");
    const response = await Promise.all(objects.map(async device => {
      const query = new Parse.Query(new Sensor());
      query.equalTo("device", device);
      return query.find().then(sensors => device.set("sensors", sensors.map( s => s.toJSON()))); 
    }));
    return response;
  }

  static async afterSave(request){
    const device = request.object;
    // console.log("SENSORS", request.original);
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