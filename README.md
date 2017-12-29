# rools

This is a simple rule engine for Node.

Primary design goal was to provide a nice and state-of-the-art interface for JavaScript (ES6).
Facts are plain JavaScript or JSON objects.
Rules are specified in pure and nice JavaScript (ES6) --
rather than in a separate, special-purpose language like DSL.

Secondary design goal was to provide RETE-like efficiency and optimizations -- if possible even without being too memory consumptive.

These two goals are partially conflicting, i.e., specifying rules in pure JavaScript may prevent certain optimizations.
I was just curious how far I could get.
This started as a holiday fun project.
Have a look, if you like. Comments are welcome.

## Install

```bash
npm install --save rools
```

## Usage

This is a simple example.

```js
// facts
const user = {
  name: 'frank',
  stars: 347,
};
const weather = {
  temperature: 20,
  windy: true,
  rainy: false,
};

// rules
const ruleMoodGreat = {
  name: 'mood is great if 200 stars or more',
  when: facts => facts.user.stars >= 200,
  then: (facts) => {
    facts.user.mood = 'great';
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

// evaluation
const Rools = require('rools');

const rools = new Rools();
rools.register(ruleMoodGreat, ruleGoWalking);

const facts = { user, weather };
const result = rools.evaluate(facts);
```
This is the result:
```js
{ user: { name: 'frank', stars: 347, mood: 'great' },
  weather: { temperature: 20, windy: true, rainy: false },
  goWalking: true }
```

## Features

The engine works forward-chaining in the usual match-resolve-act cycle.
Rule evaluation is non-blocking, i.e., each evaluation step is a single block (using ES6 generators).
Not sure actually if this is sufficient if the number of rules is getting very high.

If per step there is more than one rule ready to fire (conflict set), the following conflict resolution strategies are applied (in this order):
 * Refraction -- Each rule will fire only once, at most, during any one match-resolve-act cycle.
 * Priority -- Rules with higher priority will fire first. Set the rule's property `priority` to an integer value. Default priority is `0`. Negative values are supported.
 * Order of rules -- The rules that were registered first will fire first.
