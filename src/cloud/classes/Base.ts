/* eslint-disable @typescript-eslint/no-unused-vars */

class Base extends Parse.Object {
  static async beforeSave(request: Parse.Cloud.BeforeSaveRequest) {
    const { user, master } = request;
    Object.keys(request.object.attributes).forEach((attribute) => {
      const value = request.object.get(attribute);
      if (typeof value === 'string') {
        request.object.set(attribute, value.trim());
      }
    });

    if (user) {
      if (request.object.isNew()) {
        request.object.set('createdBy', user);
      } else {
        request.object.set('updatedBy', user);
      }
    }

    let acl: Parse.ACL | undefined;
    if (request.object.isNew()) {
      acl = new Parse.ACL();
      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
    } else {
      acl = request.object.getACL();
    }

    // ensure read and write permissions to owner
    if (!master) {
      const createdBy = request.object.get('createdBy');
      if (acl && createdBy) {
        acl.setWriteAccess(createdBy, true);
        acl.setReadAccess(createdBy, true);
      }
    }
    if (acl) request.object.setACL(acl);
  }

  static afterSave(request: Parse.Cloud.AfterSaveRequest): any {
  }

  static beforeDelete(request: Parse.Cloud.BeforeDeleteRequest): any {
  }

  static afterDelete(request: Parse.Cloud.BeforeFindRequest): any {
  }

  static beforeFind(request: Parse.Cloud.BeforeFindRequest) {
    const { query, master: isMaster } = request;
    if (!isMaster) query.doesNotExist('deletedAt');
  }

  static afterFind(request: Parse.Cloud.AfterFindRequest): any {}
}

export default Base;
