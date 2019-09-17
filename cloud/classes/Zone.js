const Base = require('./Base');
class Zone extends Base {

  constructor() {
    const CLASS_NAME = "Zone";
    super(CLASS_NAME);
  }

  static async beforeSave(request){
    super.beforeSave(request);
  }

}

module.exports = Zone;