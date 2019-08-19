const { Rule } = require('../..');

const availabilityCheck = (address) => { // eslint-disable-line arrow-body-style
  return new Promise((resolve) => {
    setTimeout(() => {
      if (address.country === 'germany') {
        if (address.city === 'hamburg') {
          return resolve(['dsl', 'm4g', 'm3g']);
        }
      }
      return resolve([]);
    }, 100);
  });
};

const rule1 = new Rule({
  name: 'check availability of products (async await)',
  when: (facts) => facts.user.address.country === 'germany',
  then: async (facts) => {
    facts.products = await availabilityCheck(facts.user.address);
  },
});

const rule2 = new Rule({
  name: 'check availability of products (promises)',
  when: (facts) => facts.user.address.country === 'germany',
  then: (facts) => availabilityCheck(facts.user.address).then((result) => {
    facts.products = result;
  }),
});

module.exports = { rule1, rule2 };
