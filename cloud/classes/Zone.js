const { Parse } = global;
const Base = require('./Base');

class Zone extends Base {
  constructor() {
    super(Zone.prototype.constructor.name);
  }

  static async beforeSave(request) {
    await super.beforeSave(request);
  }

  static async afterSave(request) {
    const { object, user } = request;
    if (!object.has('defaultRole')) {
      const roleACL = new Parse.ACL();
      roleACL.setPublicReadAccess(true);
      const role = new Parse.Role(`ROLE_${Zone.name.toUpperCase()}_${object.id}`, roleACL);
      await role.save();
      object.set('defaultRole', role);
      await object.save(null, { sessionToken: user.getSessionToken() });
    }
  }

  static async afterDelete(request) {
    const { object: organization } = request;
    const role = organization.get('defaultRole');
    await role.destroy({ useMasterKey: true });
  }
}

module.exports = Zone;
