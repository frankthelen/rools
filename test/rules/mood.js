const ruleMoodGreat = {
  name: 'mood is great if 200 stars or more',
  when: facts => facts.user.stars >= 200,
  then: (facts) => {
    facts.user.mood = 'great';
  },
};

const ruleMoodSad = {
  name: 'mood is sad if less than 200 stars',
  when: facts => facts.user.stars < 200,
  then: (facts) => {
    facts.user.mood = 'sad';
  },
};

const ruleGoWalking = {
  name: 'go for a walk if mood is great and the weather is fine',
  when: [
    facts => facts.user.mood === 'great',
    facts => facts.weather.temperature >= 20,
    facts => !facts.weather.rainy,
  ],
  then: (facts) => {
    facts.goWalking = true;
  },
};

const ruleStayAtHome = {
  name: 'stay at home if mood is sad or the weather is bad',
  when: [
    facts => facts.weather.rainy || facts.user.mood === 'sad',
  ],
  then: (facts) => {
    facts.stayAtHome = true;
  },
};

module.exports = {
  ruleMoodGreat, ruleMoodSad, ruleGoWalking, ruleStayAtHome,
};
