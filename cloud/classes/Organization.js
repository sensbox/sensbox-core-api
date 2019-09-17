const Base = require('./Base');
class Organization extends Base {

  constructor() {
    super(Organization.prototype.constructor.name);
  }

  static async beforeSave(request){
    super.beforeSave(request);
    const query = new Parse.Query(new Organization());
    const name = request.object.get("name");
    query.equalTo("name", name);
    const result = await query.first({ useMasterKey: true });
    if (result && request.object.id !== result.id) throw new Parse.Error(400, JSON.stringify({ 
      name: [`${name} is already registered.`]
    }));
  }

}

module.exports = Organization;