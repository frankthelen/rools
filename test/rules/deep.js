const { Rule } = require('../../src');

const ruleTeamMoodGreat = new Rule({
  name: 'mood is great if all have 100 stars or more',
  when: (facts) => {
    const { members } = facts.team;
    return members.reduce((acc, { stars }) => acc && stars >= 100, true);
  },
  then: (facts) => {
    facts.team.mood = 'great';
  },
});

const ruleTeamGoWalking = new Rule({
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

const ruleTeamStayAtHome = new Rule({
  name: 'stay at home if mood is sad or the weather is bad',
  when: [
    (facts) => facts.weather.rainy || facts.team.mood !== 'great',
  ],
  then: (facts) => {
    facts.team.stayAtHome = true;
  },
});

module.exports = {
  ruleTeamMoodGreat, ruleTeamGoWalking, ruleTeamStayAtHome,
};
