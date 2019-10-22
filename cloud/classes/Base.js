'use strict'

class Base extends Parse.Object {

  static beforeFind(request) {
    const { query, master: isMaster} = request;
    if (!isMaster) query.doesNotExist("deletedAt");
  }

  static beforeSave(request) {
    return new Promise((resolve, reject) => {
      const { user } = request;
      Object.keys(request.object.attributes).forEach(function(attribute) {
        const value = request.object.get(attribute);
        if (typeof value === "string") {
          request.object.set(attribute, value.trim());
        }
      });
      // Save blameable information
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
