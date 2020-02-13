const { Parse } = global;
const hat = require('hat');
const Base = require('./Base');

class Dashboard extends Base {
  constructor() {
    super(Dashboard.prototype.constructor.name);
  }

  static async beforeSave(request) {
    const { object, master: isMaster } = request;
    await super.beforeSave(request);
    if (object.isNew()) {
      const uuid = hat();
      object.set('uuid', uuid);
    }
    if (!isMaster) {
      const { user } = request;
      const dashboardACL = object.isNew() ? new Parse.ACL() : object.getACL();
      const publicReadAccess = object.isNew() ? false : object.getACL().getPublicReadAccess();
      dashboardACL.setPublicReadAccess(publicReadAccess);
      dashboardACL.setReadAccess(user, true);
      dashboardACL.setWriteAccess(user, true);
      object.setACL(dashboardACL);
    }
  }
}

module.exports = Dashboard;
