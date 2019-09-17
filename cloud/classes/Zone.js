const Base = require('./Base');
class Zone extends Base {

  constructor() {
    super(Zone.prototype.constructor.name);
  }

  static async beforeSave(request){
    super.beforeSave(request);
  }

}

module.exports = Zone;