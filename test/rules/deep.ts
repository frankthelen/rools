import { Rule } from '../../src';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

export const ruleTeamMoodGreat = new Rule({
  name: 'mood is great if all have 100 stars or more',
  when: (facts: any) => {
    const { members } = facts.team;
    return members.reduce((acc: any, { stars }: any) => acc && stars >= 100, true);
  },
  then: (facts) => {
    facts.team.mood = 'great';
  },
});

export const ruleTeamGoWalking = new Rule({
  name: 'go for a walk if mood is great and the weather is fine',
  when: [
    (facts) => facts.team.mood === 'great',
    (facts) => facts.weather.temperature >= 20,
    (facts) => !facts.weather.rainy,
  ],
  then: (facts) => {
    facts.team.goWalking = true;
  },
});

export const ruleTeamStayAtHome = new Rule({
  name: 'stay at home if mood is sad or the weather is bad',
  when: [
    (facts) => facts.weather.rainy || facts.team.mood !== 'great',
  ],
  then: (facts) => {
    facts.team.stayAtHome = true;
  },
});
