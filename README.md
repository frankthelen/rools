# rools

This is a simple rule engine for Node.

[![build status](https://img.shields.io/travis/frankthelen/rools.svg)](http://travis-ci.org/frankthelen/rools)
[![Coverage Status](https://coveralls.io/repos/github/frankthelen/rools/badge.svg?branch=master)](https://coveralls.io/github/frankthelen/rools?branch=master)
[![dependencies Status](https://david-dm.org/frankthelen/rools/status.svg)](https://david-dm.org/frankthelen/rools)
[![Greenkeeper badge](https://badges.greenkeeper.io/frankthelen/rools.svg)](https://greenkeeper.io/)
[![Maintainability](https://api.codeclimate.com/v1/badges/2b21f79b2657870c146f/maintainability)](https://codeclimate.com/github/frankthelen/rools/maintainability)
[![node](https://img.shields.io/node/v/rools.svg)]()
[![License Status](http://img.shields.io/npm/l/rools.svg)]()

Primary design goal is to provide a nice and state-of-the-art interface for JavaScript (ES6).
Facts are plain JavaScript or JSON objects.
Rules are specified in pure and nice JavaScript (ES6)
rather than in a separate, special-purpose language like DSL.

Secondary design goal is to provide RETE-like efficiency and optimizations.

These goals are partially conflicting, i.e., specifying rules in pure JavaScript may prevent certain optimizations. I am curious how far I can get -- utilizing modern ES6.

It started as a holiday fun project.
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

### Rule evaluation

The engine does forward-chaining and works in the usual match-resolve-act cycle.

Rule evaluation is non-blocking, i.e., each evaluation step is one block (using ES6 generators).
Not sure actually if this is sufficient if the number of rules is getting very high.

### Conflict resolution

If there is more than one rule ready to fire (conflict set), the following conflict resolution strategies are applied (in this order):
 * Refraction -- Each rule will fire only once, at most, during any one match-resolve-act cycle.
 * Priority -- Rules with higher priority will fire first. Set the rule's property `priority` to an integer value. Default priority is `0`. Negative values are supported.
 * Order of rules -- The rules that were registered first will fire first.

### Final rules

In some cases, it is desired to stop the engine as soon as a specific rule has fired.
This is achieved by settings the respective rules' property `final` to `true`.
Default, of course, is `false`.

### Optimization of premises (`when`)

It is very common that different rules partially share the same premises.
Rools will merge identical premises into one.
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

TL;DR

Technically, this is achieved by hashing the premises
(remember, a function is an object in JavaScript).
This can be a classic function or an ES6 arrow function.
This can be a reference or the function directly.
It's tested with Node 8 and 9 (see unit tests `premises.spec.js`).

```
const md5 = require('md5');
const hash1 = md5(facts => facts.user.salery > 2000);
const hash2 = md5(facts => facts.user.salery > 2000);
const hash3 = md5(facts => facts.user.salery > 3000);
console.log(hash1 === hash2); // true
console.log(hash1 === hash3); // false
```

### Todos

Some of the features on my list are:
 * Conflict resolution by specificity
 * Optimization: re-evaluate only those premises (`when`) that are relying on modified facts
 * Support asynchronous actions (`then`)
 * More unit tests
