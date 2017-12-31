# rools

This is a simple rule engine for Node.

[![build status](https://img.shields.io/travis/frankthelen/rools.svg)](http://travis-ci.org/frankthelen/rools)
[![Coverage Status](https://coveralls.io/repos/github/frankthelen/rools/badge.svg?branch=master)](https://coveralls.io/github/frankthelen/rools?branch=master)
[![dependencies Status](https://david-dm.org/frankthelen/rools/status.svg)](https://david-dm.org/frankthelen/rools)
[![Greenkeeper badge](https://badges.greenkeeper.io/frankthelen/rools.svg)](https://greenkeeper.io/)
[![Maintainability](https://api.codeclimate.com/v1/badges/2b21f79b2657870c146f/maintainability)](https://codeclimate.com/github/frankthelen/rools/maintainability)
[![node](https://img.shields.io/node/v/rools.svg)]()
[![License Status](http://img.shields.io/npm/l/rools.svg)]()

*Primary design goal* was to provide a nice and state-of-the-art interface for JavaScript (ES6).
Facts are plain JavaScript or JSON objects.
Rules are specified in pure and nice JavaScript rather than in a separate, special-purpose language like DSL.

*Secondary design goal* was to provide RETE-like efficiency and optimization.

I was curious how far I could get -- using modern JavaScript.
And, in fact, it uses some of the cool new ES6 stuff, e.g., Generators, `Proxy`, `Reflect`, `Set`, let alone rest and spread operators, classes, destructuring, string interpolation, and so on. *Yeah, JavaScript rocks!*

It started as a holiday project.
And is still work in progress.
Have a look, if you like. Comments are welcome.

## Install

```bash
npm install --save rools
```

## Usage

This is a basic example.

```js
// facts
const facts = {
  user: {
    name: 'frank',
    stars: 347,
  },
  weather: {
    temperature: 20,
    windy: true,
    rainy: false,
  },
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
const result = rools.evaluate(facts);
```
This is the result:
```js
{ user: { name: 'frank', stars: 347, mood: 'great' },
  weather: { temperature: 20, windy: true, rainy: false },
  goWalking: true }
```

## Features

### Rule evaluation

The engine does forward-chaining and works in the usual match-resolve-act cycle.

Rule evaluation is non-blocking, i.e., each evaluation step is one execution block (using ES6 Generators).

### Conflict resolution

If there is more than one rule ready to fire, i.e., the conflict set is greater 1, the following conflict resolution strategies are applied (in this order):
 * Refraction -- Each rule will fire only once, at most, during any one match-resolve-act cycle.
 * Priority -- Rules with higher priority will fire first. Set the rule's property `priority` to an integer value. Default priority is `0`. Negative values are supported.
 * Order of rules -- The rules that were registered first will fire first.

### Final rules

For optimization purposes, it might be desired to stop the engine as soon as a specific rule has fired.
This can be achieved by settings the respective rules' property `final` to `true`.
Default, of course, is `false`.

Example:
```js
const rule = {
  name: 'a final rule',
  ...
  final: true,
};
```

### Optimization I

It is very common that different rules partially share the same premises.
Rools will automatically merge identical premises into one.
You are free to use references or just to repeat the same premise.
Both cases are working fine.

Example 1: by reference
```js
const isApplicable = facts => facts.user.salery >= 2000;
const rule1 = {
  when: isApplicable,
  ...
};
const rule2 = {
  when: isApplicable,
  ...
};
```

Example 2: repeat premise
```js
const rule1 = {
  when: facts => facts.user.salery >= 2000,
  ...
};
const rule2 = {
  when: facts => facts.user.salery >= 2000,
  ...
};
```

Furthermore, it is recommended to de-compose premises containing AND relations (`&&`).
For example:

```js
// this version works...
const rule = {
  when: facts => facts.user.salery >= 2000 && facts.user.age > 25,
  ...
};
// however, it's better write it like this...
const rule = {
  when: [
    facts => facts.user.salery >= 2000,
    facts => facts.user.age > 25,
  ],
  ...
};
```

One last thing. Look at the following example.
Rools will treat the two premises (`when`) as identical.
This is because `value` is a reference which is *not* evaluated at registration time (`Rools.register()`).
Later on, at evaluation time (`Rools.evaluate()`), both rules are clearly identical.

```js
let value = 2000;
const rule1 = {
  when: facts => facts.user.salery >= value,
  ...
};
value = 3000;
const rule2 = {
  when: facts => facts.user.salery >= value,
  ...
};
```

TL;DR

Technically, this is achieved by hashing the premise functions (remember, functions are "first-class" objects in JavaScript).
This can be a classic function or an ES6 arrow function.
This can be a reference or the function directly.
It's tested with Node 8 and 9 (see unit tests `premises.spec.js`).

```js
const md5 = require('md5');
const hash1 = md5(facts => facts.user.salery > 2000);
const hash2 = md5(facts => facts.user.salery > 2000);
const hash3 = md5(facts => facts.user.salery > 3000);
console.log(hash1 === hash2); // true
console.log(hash1 === hash3); // false
```

### Optimization II

When actions fire, changes are made to the facts.
This requires re-evaluation of the premises.
Which may lead to further actions becoming ready to fire.

To avoid complete re-evaluation of all premises each time changes are made to the facts, Rools detects the parts of the facts (segments) that were actually changed and re-evaluates only those premises affected.

Change detection is based on *level 1 of the facts*. In the example below, detected changes are based on `user`, `weather`, `posts` and so on. So, whenever a `user` detail changes, all premises and actions that rely on `user` are re-evaluated. But only those.

As you can imagine, this kind of optimization requires some additional overhead (code complexity and runtime memory consumption). It unfolds its potential with the number of rules and the number of fact segments.

```js
const facts = {
  user: { ... },
  weather: { ... },
  posts: { ... },
  ...
}
```

TL;DR

Technically, this is achieved by observing the facts through ES6's new `Proxy` and `Reflect` APIs.

### Todos

Some of the features on my list are:
 * Conflict resolution by specificity
 * Asynchronous actions (`then`)
 * More unit tests
