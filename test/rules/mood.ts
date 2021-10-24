import { Rule } from '../../src';

export const ruleMoodGreat = new Rule({
  name: 'mood is great if 200 stars or more',
  when: (facts) => facts.user.stars >= 200,
  then: (facts) => {
    facts.user.mood = 'great';
  },
});

export const ruleMoodSad = new Rule({
  name: 'mood is sad if less than 200 stars',
  when: (facts) => facts.user.stars < 200,
  then: (facts) => {
    facts.user.mood = 'sad';
  },
});

export const ruleGoWalking = new Rule({
  name: 'go for a walk if mood is great and the weather is fine',
  when: [
    (facts) => facts.user.mood === 'great',
    (facts) => facts.weather.temperature >= 20,
    (facts) => !facts.weather.rainy,
  ],
  then: (facts) => {
    facts.goWalking = true;
  },
});

export const ruleStayAtHome = new Rule({
  name: 'stay at home if mood is sad or the weather is bad',
  when: [
    (facts) => (facts.weather.rainy || facts.user.mood === 'sad') as boolean,
  ],
  then: (facts) => {
    facts.stayAtHome = true;
  },
});
