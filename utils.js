const nullParser = (opt) => {
  if (opt === 'null') {
    return null;
  }
  return opt;
};

// eslint-disable-next-line import/prefer-default-export
export { nullParser };
