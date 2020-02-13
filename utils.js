const nullParser = (opt) => {
  if (opt === 'null') {
    return null;
  }
  return opt;
};

module.exports = { nullParser };
