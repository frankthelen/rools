# rools

This is a small rule engine for Node.

[![build status](https://img.shields.io/travis/frankthelen/rools.svg)](http://travis-ci.org/frankthelen/rools)
[![Coverage Status](https://coveralls.io/repos/github/frankthelen/rools/badge.svg?branch=master)](https://coveralls.io/github/frankthelen/rools?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/frankthelen/rools.svg)](https://gemnasium.com/github.com/frankthelen/rools)
[![Greenkeeper badge](https://badges.greenkeeper.io/frankthelen/rools.svg)](https://greenkeeper.io/)
[![Maintainability](https://api.codeclimate.com/v1/badges/2b21f79b2657870c146f/maintainability)](https://codeclimate.com/github/frankthelen/rools/maintainability)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ffrankthelen%2Frools.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Ffrankthelen%2Frools?ref=badge_shield)
[![node](https://img.shields.io/node/v/rools.svg)]()
[![License Status](http://img.shields.io/npm/l/rools.svg)]()

*Primary goal* was to provide a nice and state-of-the-art interface for modern JavaScript (ES6).
*Facts* are plain JavaScript or JSON objects or objects from ES6 classes with getters and setters.
*Rules* are specified in pure JavaScript rather than in a separate, special-purpose language like DSL.

*Secondary goal* was to provide [RETE](https://en.wikipedia.org/wiki/Rete_algorithm)-like efficiency and optimization.

Mission accomplished! JavaScript rocks!

See [migration info](#migration) for breaking changes between major versions 1.x.x and 2.x.x.

## Install

```bash
npm install --save rools
```

## Usage

This is a basic example.

```javascript
// import Rools
const Rools = require('rools');

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
const rools = new Rools();
await rools.register([ruleMoodGreat, ruleGoWalking]);
await rools.evaluate(facts);
```
These are the resulting facts:
```javascript
{ user: { name: 'frank', stars: 347, mood: 'great' },
  weather: { temperature: 20, windy: true, rainy: false },
  goWalking: true,
}
```

## Features

### Rule engine

The engine does forward-chaining and works in the usual match-resolve-act cycle.

### Facts and rules

Facts are plain JavaScript or JSON objects or objects from ES6 classes with getters and setters.

Rules are specified in pure JavaScript, i.e., they have premises (`when`) and actions (`then`).
Both are JavaScript functions, i.e., classic functions or ES6 arrow functions.
Actions can also be asynchronous.

Rules access the facts in both, premises (`when`) and actions (`then`).
They can access properties directly, e.g., `facts.user.salery`,
or through getters and getters if applicable, e.g., `facts.user.getSalery()`.

### Conflict resolution

If there is more than one rule ready to fire, i.e., the conflict set is greater 1, the following conflict resolution strategies are applied (by default, in this order):
 * Refraction -- Each rule will fire only once, at most, during any one match-resolve-act cycle.
 * Priority -- Rules with higher priority will fire first. Set the rule's property `priority` to an integer value. Default priority is `0`. Negative values are supported.
 * Specificity -- Rules which are more specific will fire first. For example, there is rule R1 with premises P1 and P2, and rule R2 with premises P1, P2 and P3. R2 is more specific than R1 and will fire first. R2 is more specific than R1 because it has *all* premises of R1 and additional ones.
 * Order of rules -- The rules that were registered first will fire first.

### Final rules

For optimization purposes, it might be desired to stop the engine as soon as a specific rule has fired.
This can be achieved by settings the respective rules' property `final` to `true`.
Default, of course, is `false`.

### Async actions

While premises (`when`) are always working synchronously on the facts,
actions (`then`) can be synchronous or asynchronous.

Example: asynchronous action using async/await
```javascript
const rule = {
  name: 'check availability',
  when: facts => facts.user.address.country === 'germany',
  then: async (facts) => {
    facts.products = await availabilityCheck(facts.user.address);
  },
};
```

Example: asynchronous action using promises
```javascript
const rule = {
  name: 'check availability',
  when: facts => facts.user.address.country === 'germany',
  then: facts =>
    availabilityCheck(facts.user.address)
      .then((result) => {
        facts.products = result;
      }),
};
```

### Optimization I

It is very common that different rules partially share the same premises.
Rools will automatically merge identical premises into one.
You are free to use references or just to repeat the same premise.
Both options are working fine.

Example 1: by reference
```javascript
const isApplicable = facts => facts.user.salery >= 2000;
const rule1 = {
  when: [
    isApplicable,
    ...
  ],
  ...
};
const rule2 = {
  when: [
    isApplicable,
    ...
  ],
  ...
};
```

Example 2: repeat premise
```javascript
const rule1 = {
  when: [
    facts => facts.user.salery >= 2000,
    ...
  ],
  ...
};
const rule2 = {
  when: [
    facts => facts.user.salery >= 2000,
    ...
  ],
  ...
};
```

Furthermore, it is recommended to de-compose premises with AND relations (`&&`).
For example:

```javascript
// this version works...
const rule = {
  when: facts => facts.user.salery >= 2000 && facts.user.age > 25,
  ...
};
// however, it's better to write it like this...
const rule = {
  when: [
    facts => facts.user.salery >= 2000,
    facts => facts.user.age > 25,
  ],
  ...
};
```

One last thing. Look at the example below.
Rools will treat the two premises (`when`) as identical.
This is because `value` is a reference which is *not* evaluated at registration time (`register()`).
Later on, at evaluation time (`evaluate()`), both rules are clearly identical.

```javascript
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

*TL;DR* -- Technically, this is achieved by hashing the premise functions (remember, functions are "first-class" objects in JavaScript). This can be a classic function or an ES6 arrow function; it can be a reference or the function directly.

### Optimization II

When actions fire, changes are made to the facts.
This requires re-evaluation of the premises.
Which may lead to further actions becoming ready to fire.

To avoid complete re-evaluation of all premises each time changes are made to the facts, Rools detects the parts of the facts (segments) that were actually changed and re-evaluates only those premises affected.

Change detection is based on *level 1 of the facts*. In the example below, detected changes are based on `user`, `weather`, `posts` and so on. So, whenever a `user` detail changes, all premises and actions that rely on `user` are re-evaluated. But only those.

```javascript
const facts = {
  user: { ... },
  weather: { ... },
  posts: { ... },
  ...
};
...
await rools.evaluate(facts);
```

This optimization targets runtime performance.
It unfolds its full potential with a growing number of rules and fact segments.

*TL;DR* -- Technically, this is achieved by observing the facts through the ES6 `Proxy` API.

## Interface

### Create rule engine: `new Rools()`

Calling `new Rools()` creates a new Rools instance, i.e., a new rule engine.
You usually do this once for a given set of rules.

Example:
```javascript
const Rools = require('rools');
const rools = new Rools();
...
```

### Register rules: `register()`

Rules are plain JavaScript objects with the following properties:

| Property    | Required | Default | Description |
|-------------|----------|---------|-------------|
| `name`      | yes      | -       | A string value identifying the rule. This is used logging and debugging purposes only. |
| `when`      | yes      | -       | A synchronous JavaScript function or an array of functions. These are the premises of your rule. The functions' interface is `(facts) => { ... }`. They must return a boolean value. |
| `then`      | yes      | -       | A synchronous or asynchronous JavaScript function to be executed when the rule fires. The function's interface is `(facts) => { ... }` or `async (facts) => { ... }`. |
| `priority`  | no       | `0`     | If during `evaluate()` there is more than one rule ready to fire, i.e., the conflict set is greater 1, rules with higher priority will fire first. Negative values are supported. |
| `final`     | no       | `false` | Marks a rule as final. If during `evaluate()` a final rule fires, the engine will stop the evaluation. |

Rules access the facts in both, premises (`when`) and actions (`then`).
They can access properties directly, e.g., `facts.user.salery`,
or through getters and getters if applicable, e.g., `facts.user.getSalery()`.

`register()` registers one or more rules to the rule engine.
It can be called multiple time.
New rules will become effective immediately.

`register()` is working asynchronously, i.e., it returns a promise.
Its promise may be rejected, e.g., if a rule is formally incorrect.
If this happens, the affected Rools instance is inconsistent and should no longer be used.

Example:
```javascript
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
const rools = new Rools();
await rools.register([ruleMoodGreat, ruleGoWalking]);
```

### Evaluate facts: `evaluate()`

Facts are plain JavaScript or JSON objects. For example:
```javascript
const user = {
  name: 'frank',
  stars: 347,
};
const weather = {
  temperature: 20,
  windy: true,
  rainy: false,
};
const rools = new Rools();
await rools.register(...);
await rools.evaluate({ user, weather });
```

Please note that Rools reads the facts (`when`) as well as writes to the facts (`then`) during evaluation.
Please make sure you provide a fresh set of facts whenever you call `evaluate()`.

`evaluate()` is working asynchronously, i.e., it returns a promise.
If a premise (`when`) fails, `evaluate()` will still *not* fail (for robustness reasons).
If an action (`then`) fails, `evaluate()` will reject its promise.

If there is more than one rule ready to fire, Rools applies a *conflict resolution strategy* to decide which rule/action to fire first. The default conflict resolution strategy is 'ps'.
 * 'ps' (default) -- (1) priority, (2) specificity, (3) order of registration
 * 'sp' -- (1) specificity, (2) priority, (3) order of registration

If you don't like the default, change the conflict resolution strategy like this:
```javascript
await rools.evaluate(facts, { strategy: 'sp' });
```

### Logging

By default, Rools is logging errors to the JavaScript `console`.
This can be configured like this.

```javascript
const delegate = ({ level, message, rule, error }) => {
  console.error(level, message, rule, error);
};
const rools = new Rools({
  logging: { error: true, debug: false, delegate },
});
...
```

## Migration

### Version 1.x.x to Version 2.x.x

There are two breaking changes that require some little changes to your code.

`register()` takes the rules to register as an array now.
Reason is to allow a second options parameter in future releases.

Version 1.x.x
```javascript
await register(rule1, rule2, rule3);
```

Version 2.x.x
```javascript
await register([rule1, rule2, rule3]);
```

`evaluate()` does not return the facts which was only for convenience anyway.
Instead, it returns an object with some useful information about what it was actually doing. `updated` lists the names of the fact segments that were actually updated during evaluation. `fired` is number of rules that were fired. `elapsed` is the number of milliseconds needed.

Version 1.x.x
```javascript
const facts = await evaluate({ user, weather });
```

Version 2.x.x
```javascript
const { updated, fired, elapsed } = await evaluate({ user, weather });
console.log(updated, fired, elapsed); // e.g., ["user"] 26 536
```
