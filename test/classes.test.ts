import { Rools, Rule } from '../src';

interface PersonOptions {
  name: string;
  stars: number;
  salery: number;
}

class Person {
  name: string;
  mood: string;
  stars: number;
  salery: number;

  constructor({ name, stars, salery }: PersonOptions) {
    this.name = name;
    this.mood = 'unknown';
    this.stars = stars;
    this.salery = salery;
  }

  getStars(): number {
    return this.stars;
  }

  setStars(stars: number): void {
    this.stars = stars;
  }

  getSalery(): number {
    return this.salery;
  }

  setSalery(salery: number): void {
    this.salery = salery;
  }

  getMood(): string {
    return this.mood;
  }

  setMood(mood: string): void {
    this.mood = mood;
  }
}

interface Facts {
  user: Person;
  result?: boolean;
}

const rule1 = new Rule({
  name: 'mood is great if 200 stars or more',
  when: (facts: Facts) => facts.user.getStars() >= 200,
  then: (facts: Facts) => {
    facts.user.setMood('great');
  },
});

const rule2 = new Rule({
  name: 'mark applicable if mood is great and salery greater 1000',
  when: [
    (facts: Facts) => facts.user.getMood() === 'great',
    (facts: Facts) => facts.user.getSalery() > 1000,
  ],
  then: (facts: Facts) => {
    facts.result = true;
  },
});

describe('Rools.evaluate() / classes with getters and setters', () => {
  it('should set mood in 1 pass', async () => {
    const facts: Facts = {
      user: new Person({ name: 'frank', stars: 347, salery: 1234 }),
    };
    const rools = new Rools();
    await rools.register([rule1]);
    await rools.evaluate(facts);
    expect(facts.user.mood).toEqual('great');
  });

  it('should set result in 2 passes', async () => {
    const facts: Facts = {
      user: new Person({ name: 'frank', stars: 347, salery: 1234 }),
    };
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    await rools.evaluate(facts);
    expect(facts.user.mood).toEqual('great');
    expect(facts.result).toEqual(true);
  });
});
