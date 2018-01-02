const frank = {
  name: 'frank',
  stars: 347,
  dateOfBirth: new Date('1995-01-01'),
  address: {
    city: 'hamburg',
    street: 'redderkoppel',
    country: 'germany',
  },
};

const michael = {
  name: 'michael',
  stars: 156,
  dateOfBirth: new Date('1999-08-08'),
  address: {
    city: 'san Francisco',
    street: 'willard',
    country: 'usa',
  },
};

module.exports = () => ({
  frank: JSON.parse(JSON.stringify(frank)),
  michael: JSON.parse(JSON.stringify(michael)),
});
