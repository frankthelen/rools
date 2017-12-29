const frank = {
  name: 'frank',
  stars: 347,
};

const michael = {
  name: 'michael',
  stars: 156,
};

module.exports = () => ({
  frank: { ...frank },
  michael: { ...michael },
});
