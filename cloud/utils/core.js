const { Parse } = global;
const classes = [];

function registerClasses(...args) {
  args.forEach((c) => classes.push(c));
}

function loadTriggers() {
  classes.forEach((c) => {
    Parse.Cloud.beforeSave(c.name, c.beforeSave);
    Parse.Cloud.afterSave(c.name, c.afterSave);
    Parse.Cloud.beforeDelete(c.name, c.beforeDelete);
    Parse.Cloud.afterDelete(c.name, c.afterDelete);
    Parse.Cloud.beforeFind(c.name, c.beforeFind);
    Parse.Cloud.beforeFind(c.name, c.beforeFind);
    Parse.Cloud.afterFind(c.name, c.afterFind);
  });
}

module.exports = {
  registerClasses,
  loadTriggers,
};
