const Rools = require('../src');
require('./setup');

describe('Rules.register() / optimization of premises', () => {
  it('should not merge premises if not identical', () => {
    const rule1 = {
      name: 'rule1',
      when: facts => facts.user.name === 'frank',
      then: () => {},
    };
    const rule2 = {
      name: 'rule2',
      when: facts => facts.user.name === 'michael',
      then: () => {},
    };
    const rools = new Rools();
    rools.register(rule1, rule2);
    expect(rools.premises.length).to.be.equal(2);
  });

  it('should merge premises if identical / reference / arrow function', () => {
    const isFrank = facts => facts.user.name === 'frank';
    const rule1 = {
      name: 'rule1',
      when: isFrank,
      then: () => {},
    };
    const rule2 = {
      name: 'rule2',
      when: isFrank,
      then: () => {},
    };
    const rools = new Rools();
    rools.register(rule1, rule2);
    expect(rools.premises.length).to.be.equal(1);
  });

  it('should merge premises if identical / reference / classic function', () => {
    function isFrank(facts) {
      return facts.user.name === 'frank';
    }
    const rule1 = {
      name: 'rule1',
      when: isFrank,
      then: () => {},
    };
    const rule2 = {
      name: 'rule2',
      when: isFrank,
      then: () => {},
    };
    const rools = new Rools();
    rools.register(rule1, rule2);
    expect(rools.premises.length).to.be.equal(1);
  });

  it('should merge premises if identical / hash / arrow function', () => {
    const rule1 = {
      name: 'rule1',
      when: facts => facts.user.name === 'frank',
      then: () => {},
    };
    const rule2 = {
      name: 'rule2',
      when: facts => facts.user.name === 'frank',
      then: () => {},
    };
    const rools = new Rools();
    rools.register(rule1, rule2);
    expect(rools.premises.length).to.be.equal(1);
  });

  it('should merge premises if identical / hash / classic function()', () => {
    const rule1 = {
      name: 'rule1',
      when: function p(facts) {
        return facts.user.name === 'frank';
      },
      then: () => {},
    };
    const rule2 = {
      name: 'rule2',
      when: function p(facts) {
        return facts.user.name === 'frank';
      },
      then: () => {},
    };
    const rools = new Rools();
    rools.register(rule1, rule2);
    expect(rools.premises.length).to.be.equal(1);
  });

  it('should merge premises if identical / hash / slightly different', () => {
    const rule1 = {
      name: 'rule1',
      when: facts => facts.user.name === 'frank',
      then: () => {},
    };
    const rule2 = {
      name: 'rule2',
      when: facts => facts.user.name === "frank", // eslint-disable-line quotes
      then: () => {},
    };
    const rools = new Rools();
    rools.register(rule1, rule2);
    expect(rools.premises.length).to.be.equal(1);
  });

  it('should not merge premises if not identical / with Date object', () => {
    const date1 = new Date('2000-01-01');
    const date2 = new Date('1990-01-01');
    const rule1 = {
      name: 'rule1',
      when: facts => facts.user.birthdate > date1,
      then: () => {},
    };
    const rule2 = {
      name: 'rule2',
      when: facts => facts.user.birthdate > date2,
      then: () => {},
    };
    const rools = new Rools();
    rools.register(rule1, rule2);
    expect(rools.premises.length).to.be.equal(2);
  });

  it('should merge premises if identical / with Date object', () => {
    const date = new Date('2000-01-01');
    const rule1 = {
      name: 'rule1',
      when: facts => facts.user.birthdate > date,
      then: () => {},
    };
    const rule2 = {
      name: 'rule2',
      when: facts => facts.user.birthdate > date,
      then: () => {},
    };
    const rools = new Rools();
    rools.register(rule1, rule2);
    expect(rools.premises.length).to.be.equal(1);
  });
});
