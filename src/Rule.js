const isBoolean = require('lodash/isBoolean');
const isFunction = require('lodash/isFunction');
const isInteger = require('lodash/isInteger');
const isString = require('lodash/isString');
const assert = require('assert');
const arrify = require('arrify');

class Rule {
  constructor({
    name, when, then, priority = 0, final = false, extend, activationGroup,
  }) {
    this.name = name;
    this.when = arrify(when);
    this.then = then;
    this.priority = priority;
    this.final = final;
    this.extend = arrify(extend);
    this.activationGroup = activationGroup;
    this.assert();
  }

  assert() {
    assert(
      this.name,
      '"name" is required',
    );
    assert(
      isString(this.name),
      '"name" must be a string',
    );
    assert(
      this.when.length,
      '"when" is required with at least one premise',
    );
    assert(
      this.when.reduce((acc, premise) => acc && isFunction(premise), true),
      '"when" must be a function or an array of functions',
    );
    assert(
      this.then,
      '"then" is required',
    );
    assert(
      isFunction(this.then),
      '"then" must be a function',
    );
    assert(
      isInteger(this.priority),
      '"priority" must be an integer',
    );
    assert(
      isBoolean(this.final),
      '"final" must be a boolean',
    );
    assert(
      this.extend.reduce((acc, rule) => acc && (rule instanceof Rule), true),
      '"extend" must be a Rule or an array of Rules',
    );
    assert(
      !this.activationGroup || isString(this.activationGroup),
      '"activationGroup" must be a string',
    );
  }
}

module.exports = Rule;
