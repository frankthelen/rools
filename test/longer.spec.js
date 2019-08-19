const { Rools, Rule } = require('..');
require('./setup');

describe('Rools.evaluate() / longer cycle', () => {
  let rools;

  before(async () => {
    const rule0 = new Rule({
      name: 'rule0',
      when: (facts) => facts.user.stars === 0,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule1 = new Rule({
      name: 'rule1',
      when: (facts) => facts.user.stars === 1,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: (facts) => facts.user.stars === 2,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule3 = new Rule({
      name: 'rule3',
      when: (facts) => facts.user.stars === 3,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule4 = new Rule({
      name: 'rule4',
      when: (facts) => facts.user.stars === 4,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule5 = new Rule({
      name: 'rule5',
      when: (facts) => facts.user.stars === 5,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule6 = new Rule({
      name: 'rule6',
      when: (facts) => facts.user.stars === 6,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule7 = new Rule({
      name: 'rule7',
      when: (facts) => facts.user.stars === 7,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule8 = new Rule({
      name: 'rule8',
      when: (facts) => facts.user.stars === 8,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    const rule9 = new Rule({
      name: 'rule9',
      when: (facts) => facts.user.stars === 9,
      then: (facts) => {
        facts.user.stars += 1;
      },
    });
    rools = new Rools();
    await rools.register([rule7, rule0, rule2, rule3, rule1, rule6, rule8, rule4, rule9, rule5]);
  });

  it('should fire 10 rules in 10 passes', async () => {
    const frank = {
      name: 'frank',
      stars: 0,
    };
    await rools.evaluate({ user: frank });
    expect(frank.stars).to.be.equal(10);
  });
});
