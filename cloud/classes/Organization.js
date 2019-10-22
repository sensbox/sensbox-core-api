const Base = require('./Base');
class Organization extends Base {

  constructor() {
    super(Organization.prototype.constructor.name);
  }

  static async beforeSave(request){
    await super.beforeSave(request);
    const query = new Parse.Query(new Organization());
    const name = request.object.get("name");
    query.equalTo("name", name);
    const result = await query.first({ useMasterKey: true });
    if (result && request.object.id !== result.id) throw new Parse.Error(400, JSON.stringify({ 
      name: [`${name} is already registered.`]
    }));
  }

  static async afterDelete(request){
    const { object: organization } = request;
    const Zone = Parse.Object.extend("Zone");
    const query = new Parse.Query(new Zone());
    query.equalTo("organization", organization.toPointer());
    const zones = await query.find({ useMasterKey: true });
    Parse.Object.destroyAll(zones, { useMasterKey: true });
  }
}

module.exports = Organization;