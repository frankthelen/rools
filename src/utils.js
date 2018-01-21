const arrify = (obj) => {
  if (Array.isArray(obj)) {
    return obj;
  }
  return obj === undefined ? [] : [obj];
};

module.exports = { arrify };
