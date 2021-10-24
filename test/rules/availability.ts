import { Rule } from '../../src';

const availabilityCheck = (address: any): Promise<any> => {
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

export const rule1 = new Rule({
  name: 'check availability of products (async await)',
  when: (facts) => facts.user.address.country === 'germany',
  then: async (facts) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    facts.products = await availabilityCheck(facts.user.address);
  },
});

export const rule2 = new Rule({
  name: 'check availability of products (promises)',
  when: (facts) => facts.user.address.country === 'germany',
  then: (facts) => availabilityCheck(facts.user.address).then((result) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    facts.products = result;
  }),
});
