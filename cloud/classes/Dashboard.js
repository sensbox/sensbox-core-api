const Base = require('./Base');
class Dashboard extends Base {

  constructor() {
    super(Dashboard.prototype.constructor.name);
  }

  static async beforeSave(request){
    const { master: isMaster} = request;
    if (!isMaster) {
      await super.beforeSave(request);
      const { object, user } = request;
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