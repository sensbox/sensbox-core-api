const { Parse } = global;
const { getUserRoles } = require('../utils');

class Base extends Parse.Object {
  static async beforeSave(request) {
    const { user, master } = request;
    Object.keys(request.object.attributes).forEach((attribute) => {
      const value = request.object.get(attribute);
      if (typeof value === 'string') {
        request.object.set(attribute, value.trim());
      }
    });
    // Save blameable information
    if (request.object.isNew()) {
      if (user) request.object.set('createdBy', user);
      const acl = new Parse.ACL();
      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
      acl.setRoleWriteAccess('ROLE_SUPER_ADMIN', true);
      acl.setRoleReadAccess('ROLE_SUPER_ADMIN', true);
      if (!master) {
        const roles = await getUserRoles(user);
        const userIsSuperAdmin = roles.map((r) => r.get('name')).includes('ROLE_SUPER_ADMIN');
        if (!userIsSuperAdmin) {
          acl.setWriteAccess(user, true);
          acl.setReadAccess(user, true);
        }
      }
      request.object.setACL(acl);
    } else if (user) request.object.set('updatedBy', user);
  }

  static afterSave() {}

  static beforeDelete() {}

  static afterDelete() {}

  static beforeFind(request) {
    const { query, master: isMaster } = request;
    if (!isMaster) query.doesNotExist('deletedAt');
  }

  static afterFind() {}
}

module.exports = Base;
