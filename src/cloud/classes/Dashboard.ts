
import Base from './Base';

const hat = require('hat');

class Dashboard extends Base {
  constructor() {
    super(Dashboard.prototype.constructor.name);
  }

  static async beforeSave(request: Parse.Cloud.BeforeSaveRequest) {
    const { object, master: isMaster } = request;
    await super.beforeSave(request);
    if (object.isNew()) {
      const uuid = hat();
      object.set('uuid', uuid);
    }
    if (!isMaster) {
      const { user } = request;
      const dashboardACL = object.isNew() ? new Parse.ACL() : object.getACL();
      if (user && dashboardACL) {
        const publicReadAccess = object.isNew() ? false : dashboardACL.getPublicReadAccess();
        dashboardACL.setPublicReadAccess(publicReadAccess);
        dashboardACL.setReadAccess(user, true);
        dashboardACL.setWriteAccess(user, true);
        object.setACL(dashboardACL);
      }
    }
  }
}

export default Dashboard;
