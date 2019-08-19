const { Rools, Rule } = require('..');
require('./setup');

class Person {
  constructor({ name, stars, salery }) {
    this.name = name;
    this.mood = 'unknown';
    this.stars = stars;
    this.salery = salery;
  }

  getStars() {
    return this.stars;
  }

  setStars(stars) {
    this.stars = stars;
  }

  getSalery() {
    return this.salery;
  }

  setSalery(salery) {
    this.salery = salery;
  }

  getMood() {
    return this.mood;
  }

  setMood(mood) {
    this.mood = mood;
  }
}

const rule1 = new Rule({
  name: 'mood is great if 200 stars or more',
  when: (facts) => facts.user.getStars() >= 200,
  then: (facts) => {
    facts.user.setMood('great');
  },
});

const rule2 = new Rule({
  name: 'mark applicable if mood is great and salery greater 1000',
  when: [
    (facts) => facts.user.getMood() === 'great',
    (facts) => facts.user.getSalery() > 1000,
  ],
  then: (facts) => {
    facts.result = true;
  },
});

describe('Rools.evaluate() / classes with getters and setters', () => {
  it('should set mood in 1 pass', async () => {
    const facts = {
      user: new Person({ name: 'frank', stars: 347, salery: 1234 }),
    };
    const rools = new Rools();
    await rools.register([rule1]);
    await rools.evaluate(facts);
    // console.log(result); // eslint-disable-line no-console
    expect(facts.user.mood).to.be.equal('great');
  });

  it('should set result in 2 passes', async () => {
    const facts = {
      user: new Person({ name: 'frank', stars: 347, salery: 1234 }),
    };
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    await rools.evaluate(facts);
    // console.log(result); // eslint-disable-line no-console
    expect(facts.user.mood).to.be.equal('great');
    expect(facts.result).to.be.equal(true);
  });
});
