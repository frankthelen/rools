# rools

A small rule engine for Node.

![main workflow](https://github.com/frankthelen/rools/actions/workflows/main.yml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/frankthelen/rools/badge.svg?branch=master)](https://coveralls.io/github/frankthelen/rools?branch=master)
![Dependency Status](https://img.shields.io/librariesio/release/npm/rools)
[![Maintainability](https://api.codeclimate.com/v1/badges/d1f858c321b03000fc63/maintainability)](https://codeclimate.com/github/frankthelen/rools/maintainability)
[![node](https://img.shields.io/node/v/rools.svg)](https://nodejs.org)
[![code style](https://img.shields.io/badge/code_style-airbnb-brightgreen.svg)](https://github.com/airbnb/javascript)
![Types](https://img.shields.io/npm/types/rools)
![Module](https://img.shields.io/badge/module-hybrid%20cjs%2Fesm-blue)
![License Status](https://img.shields.io/npm/l/rools)

*Primary goal* was to provide a nice and state-of-the-art interface for modern JavaScript (ES6).
*Facts* are plain JavaScript or JSON objects or objects from ES6 classes with getters and setters.
*Rules* are specified in pure JavaScript rather than in a separate, special-purpose language like DSL.

*Secondary goal* was to provide [RETE](https://en.wikipedia.org/wiki/Rete_algorithm)-like efficiency and optimization.

Mission accomplished! JavaScript rocks!

* TypeScript -- types included
* CommonsJS (cjs) -- supporting Node 12+
* ES Modules (esm) -- supporting Node 14+

See [migration info](#migration) for breaking changes from previous major versions.

## Install

```bash
npm install rools
```

## Usage

This is a basic example.

```javascript
// import
const { Rools, Rule } = require('rools');

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
const ruleMoodGreat = new Rule({
  name: 'mood is great if 200 stars or more',
  when: (facts) => facts.user.stars >= 200,
  then: (facts) => {
    facts.user.mood = 'great';
  },
});
const ruleGoWalking = new Rule({
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
It tries to deduce as much knowledge as possible from the given facts and rules.
If there is no further knowledge to gain, it stops.

### Facts and rules

Facts are plain JavaScript or JSON objects or objects from ES6 classes with getters and setters.

Rules are specified in pure JavaScript via `new Rule()`.
They have premises (`when`) and actions (`then`).
Both are JavaScript functions, i.e., classic functions or ES6 arrow functions.
Actions can also be asynchronous.

Rules access the facts in both, premises (`when`) and actions (`then`).
They can access properties directly, e.g., `facts.user.salary`,
or through getters and setters if applicable, e.g., `facts.user.getSalary()`.

### Conflict resolution

If there is more than one rule ready to fire, i.e., the conflict set is greater 1, the following conflict resolution strategies are applied (by default, in this order):

* Refraction -- Each rule will fire only once, at most, during any one match-resolve-act cycle.
* Priority -- Rules with higher priority will fire first. Set the rule's property `priority` to an integer value. Default priority is `0`. Negative values are supported.
* Specificity -- Rules which are more specific will fire first. For example, there is rule R1 with premises P1 and P2, and rule R2 with premises P1, P2 and P3. R2 is more specific than R1 and will fire first. R2 is more specific than R1 because it has *all* premises of R1 and additional ones.
* Order of rules -- The rules that were registered first will fire first.

### Final rules

For optimization purposes, it can be useful to stop the engine as soon as a specific rule has fired.
This can be achieved by settings the respective rules' property `final` to `true`.
Default, of course, is `false`.

### Async actions

While premises (`when`) are always working synchronously on the facts,
actions (`then`) can be synchronous or asynchronous.

Example: asynchronous action using async/await

```javascript
const rule = new Rule({
  name: 'check availability',
  when: (facts) => facts.user.address.country === 'germany',
  then: async (facts) => {
    facts.products = await availabilityCheck(facts.user.address);
  },
});
```

Example: asynchronous action using promises

```javascript
const rule = new Rule({
  name: 'check availability',
  when: (facts) => facts.user.address.country === 'germany',
  then: (facts) =>
    availabilityCheck(facts.user.address)
      .then((result) => {
        facts.products = result;
      }),
});
```

### Extended rules

If a *rule is more specific* than another rule, you can *extend* it rather than having to repeat its premises.
The extended rule simply inherits all the premises from its parents (and their parents).
Use the rule's `extend` property to set its parents.

Example: extended rule

```javascript
const baseRule = new Rule({
  name: 'user lives in Germany',
  when: (facts) => facts.user.address.country === 'germany',
  ...
});
const extendedRule = new Rule({
  name: 'user lives in Hamburg, Germany',
  extend: baseRule, // can also be an array of rules
  when: (facts) => facts.user.address.city === 'hamburg',
  ...
});
```

### Activation groups

Only one rule within an activation group will fire during a match-resolve-act cycle, i.e.,
the first one to fire discards all other rules within the same activation group.
Use the rule's `activationGroup` property to set its activation group.

### Rule groups

Besides activation groups, Rools has currently *no other concept of grouping rules* such as agenda groups or rule flow groups which you might know from other rule engines. And there are currently no plans to support such features.

However, if that solves your needs, you can consecutively run different sets of rules against the same facts.
Rules in different instances of Rools are perfectly isolated and can, of course, run against the same facts.

Example: evaluate different sets of rules on the same facts

```javascript
const facts = {...};
const rools1 = new Rools();
const rools2 = new Rools();
await rools1.register(...); // rule set 1
await rools2.register(...); // rule set 2
await rools1.evaluate(facts);
await rools2.evaluate(facts);
```

### Optimization I

It is very common that different rules partially share the same premises.
Rools will automatically merge identical premises into one.
You are free to use references or just to repeat the same premise.
Both options are working fine.

Example 1: by reference

```javascript
const isApplicable = (facts) => facts.user.salary >= 2000;
const rule1 = new Rule({
  when: [
    isApplicable,
    ...
  ],
  ...
});
const rule2 = new Rule({
  when: [
    isApplicable,
    ...
  ],
  ...
});
```

Example 2: repeat premise

```javascript
const rule1 = new Rule({
  when: [
    (facts) => facts.user.salary >= 2000,
    ...
  ],
  ...
});
const rule2 = new Rule({
  when: [
    (facts) => facts.user.salary >= 2000,
    ...
  ],
  ...
});
```

Furthermore, it is recommended to de-compose premises with AND relations (`&&`).
For example:

```javascript
// this version works...
const rule = new Rule({
  when: (facts) => facts.user.salary >= 2000 && facts.user.age > 25,
  ...
});
// however, it's better to write it like this...
const rule = new Rule({
  when: [
    (facts) => facts.user.salary >= 2000,
    (facts) => facts.user.age > 25,
  ],
  ...
});
```

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

## Dos and don'ts

### Be careful with non-local variables in premises

Ideally, premises (`when`) are "pure functions" referring to `facts` only.
They should not refer to any other non-local variables.

If they do so, however, please note that non-local variables are resolved at
evaluation time (`evaluate()`) and *not* at registration time (`register()`).

Furthermore, please make sure that non-local variables are constant/stable
during evaluation. Otherwise, premises are not working deterministically.

In the example below, Rools will treat the two premises as identical
assuming that both rules are referring to the exact same `value`.

```javascript
let value = 2000;
const rule1 = new Rule({
  when: (facts) => facts.user.salary >= value,
  ...
});
value = 3000;
const rule2 = new Rule({
  when: (facts) => facts.user.salary >= value,
  ...
});
```

### Don't "generate" rules / Don't create rules in closures

The example below does not work!
Rools would treat all premises (`when`) as identical
assuming that all rules are referring to the exact same `value`.

```javascript
const createRule = (value) => {
  rules.push(new Rule({
    name: `Rule evaluating ${value}`,
    when: (facts) => facts.foo >= value,
    then: (facts) => // ...
  }));
};
```

### Don't mix premises and actions

Make sure not to mix premises and actions.
In the example below, the if condition should be in `when`, *not* in `then`.
If you have such cases, think about splitting rules or extending rules.

```javascript
const rule = new Rule({
  name: "rule",
  when: // ...
  then: (facts) => {
    if (facts.foo < 0) { // not good here!
      // ...
    }
  },
});
```

## Interface

### Create rule engine: `new Rools()`

Calling `new Rools()` creates a new Rools instance, i.e., a new rule engine.
You usually do this once for a given set of rules.

Example:

```javascript
const { Rools } = require('rools');
const rools = new Rools();
...
```

### Register rules: `register()`

Rules are created through `new Rule()` with the following properties:

| Property    | Required | Default | Description |
|-------------|----------|---------|-------------|
| `name`      | yes      | -       | A string value identifying the rule. This is used for logging and debugging purposes only. |
| `when`      | yes      | -       | A synchronous JavaScript function or an array of functions. These are the premises of your rule. The functions' interface is `(facts) => { ... }`. They must return a boolean value. |
| `then`      | yes      | -       | A synchronous or asynchronous JavaScript function to be executed when the rule fires. The function's interface is `(facts) => { ... }` or `async (facts) => { ... }`. |
| `priority`  | no       | `0`     | If during `evaluate()` there is more than one rule ready to fire, i.e., the conflict set is greater 1, rules with higher priority will fire first. Negative values are supported. |
| `final`     | no       | `false` | Marks a rule as final. If during `evaluate()` a final rule fires, the engine will stop the evaluation. |
| `extend`    | no       | []      | A reference to a rule or an array of rules. The new rule will inherit all premises from its parents (and their parents). |
| `activationGroup` | no | -       | A string identifying an activation group. Only one rule within an activation group will fire. |

Rules access the facts in both, premises (`when`) and actions (`then`).
They can access properties directly, e.g., `facts.user.salary`,
or through getters and setters if applicable, e.g., `facts.user.getSalary()`.

`register()` registers one or more rules to the rule engine.
It can be called multiple time.
New rules will become effective immediately.

`register()` is working asynchronously, i.e., it returns a promise.
If this promise is rejected, the affected Rools instance is inconsistent and should no longer be used.

Example:

```javascript
const { Rools, Rule } = require('rools');
const ruleMoodGreat = new Rule({
  name: 'mood is great if 200 stars or more',
  when: (facts) => facts.user.stars >= 200,
  then: (facts) => {
    facts.user.mood = 'great';
  },
});
const ruleGoWalking = new Rule({
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
const rools = new Rools();
await rools.register([ruleMoodGreat, ruleGoWalking]);
```

### Evaluate facts: `evaluate()`

Facts are plain JavaScript or JSON objects or objects from ES6 classes with getters and setters.
For example:

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

* 'ps' -- (1) priority, (2) specificity, (3) order of registration
* 'sp' -- (1) specificity, (2) priority, (3) order of registration

If you don't like the default 'ps', you can change the conflict resolution strategy like this:

```javascript
await rools.evaluate(facts, { strategy: 'sp' });
```

`evaluate()` returns an object providing some debug information about the past evaluation run:

* `fired` -- the number of rules that were fired.
* `elapsed` -- the number of milliseconds needed.
* `accessedByPremises` -- the fact segments that were accessed by premises (`when`).
* `accessedByActions` -- the fact segments that were accessed by actions (`then`). Formerly `updated` but renamed for clarification (but still provided for backward compatibility).

```javascript
const { accessedByActions, fired, elapsed } = await rools.evaluate(facts);
console.log(accessedByActions, fired, elapsed); // e.g., ["user"] 26 187
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

`level` is either `debug` or `error`.
The error log reports failed actions or premises.
The debug log reports the entire evaluation process for debugging purposes.

## TypeScript

This package provides types for TypeScript.

```typescript
import { Rools, Rule } from "rools";

// ...
```

For this module to work, your **TypeScript compiler options** must include
`"target": "ES2015"` (or later), `"moduleResolution": "node"`, and
`"esModuleInterop": true`.

## Migration

### Version 2.x.x to Version 3.x.x

Dropped Node 10 support.

Everything was converted from ES6 to TypeScript.
All tests were converted from Mocha/Chai/Sinon to Jest.
Both, mostly just for the fun of it.

The goal was to provide Rools as a *hybrid package*
utilizing multiple TypeScript targets and conditional exports:

* TypeScript -- types included (as before)
* CommonsJS (cjs) -- supporting Node 12+ (as before -- but dropping Node 10)
* ES Modules (esm) -- supporting Node 14+ (new)

Everything should work as before -- *no breaking changes*.
But since nearly everything was touched, as a precaution,
I have created a new major version.

### Version 1.x.x to Version 2.x.x

There are a few breaking changes that require changes to your code.

Rools exposes now two classes, `Rools` and `Rule`.

```javascript
// Version 1.x.x
const Rools = require('rools');
// Version 2.x.x
const { Rools, Rule } = require('rools');
```

Rules must now be created with `new Rule()`.

```javascript
// Version 1.x.x
const rule = {
  name: 'my rule',
  ...
};
// Version 2.x.x
const rule = new Rule({
  name: 'my rule',
  ...
});
```

`register()` takes the rules to be registered as an array now.
Reason is to allow a second options parameter in future releases.

```javascript
const rools = new Rools();
...
// Version 1.x.x
await rools.register(rule1, rule2, rule3);
// Version 2.x.x
await rools.register([rule1, rule2, rule3]);
```

`evaluate()` does not return the facts anymore - which was only for convenience anyway.
Instead, it returns an object with some useful information.

```javascript
const rools = new Rools();
...
// Version 1.x.x
const facts = await rools.evaluate({ user, weather });
// Version 2.x.x
const { updated, fired, elapsed } = await rools.evaluate({ user, weather });
console.log(updated, fired, elapsed); // e.g., ["user"] 26 187
```
