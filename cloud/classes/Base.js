'use strict'

class Base extends Parse.Object {

  static beforeSave(request) {
    return new Promise((resolve, reject) => {
      const { user } = request;
      if(request.object.isNew()) {
        if (user) request.object.set("createdBy", user);
      } else {
        if (user) request.object.set("updatedBy", user);
      }
      resolve(request);
    });
  }
}

module.exports = Base;
