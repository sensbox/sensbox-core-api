const { Parse } = global;
const Base = require('./Base');

class Organization extends Base {
  constructor() {
    super(Organization.prototype.constructor.name);
  }

  static async beforeSave(request) {
    await super.beforeSave(request);
    const { object } = request;
    const query = new Parse.Query('Organization');
    const name = object.get('name');
    query.equalTo('name', name);
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

  static async afterSave(request) {
    const { object, user } = request;
    if (!object.has('defaultRole')) {
      const roleACL = new Parse.ACL();
      roleACL.setPublicReadAccess(true);
      const role = new Parse.Role(`ROLE_${Organization.name.toUpperCase()}_${object.id}`, roleACL);
      await role.save();
      object.set('defaultRole', role);
      await object.save(null, { sessionToken: user.getSessionToken() });
    }
  }

  static async afterDelete(request) {
    const { object: organization } = request;
    const query = new Parse.Query('Zone');
    query.equalTo('organization', organization.toPointer());
    const zones = await query.find({ useMasterKey: true });
    Parse.Object.destroyAll(zones, { useMasterKey: true });

    const role = organization.get('defaultRole');
    await role.destroy({ useMasterKey: true });
  }
}

module.exports = Organization;
