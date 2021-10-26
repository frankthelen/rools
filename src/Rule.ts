import _ from 'lodash';
import assert from 'assert';
import arrify from 'arrify';

import { Premise as PremiseFunc, Action as ActionFunc } from './index.d';

interface RuleOptions {
  name: string;
  when: PremiseFunc | PremiseFunc[];
  then: ActionFunc;
  priority?: number;
  final?: boolean;
  extend?: Rule | Rule[];
  activationGroup?: string;
}

export default class Rule {
  name: string;
  when: PremiseFunc[];
  then: ActionFunc;
  priority: number;
  final: boolean;
  extend: Rule[];
  activationGroup?: string;

  constructor({
    name, when, then, priority = 0, final = false, extend, activationGroup,
  }: RuleOptions) {
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
      _.isString(this.name),
      '"name" must be a string',
    );
    assert(
      this.when.length,
      '"when" is required with at least one premise',
    );
    assert(
      this.when.reduce((acc, premise) => acc && _.isFunction(premise), true),
      '"when" must be a function or an array of functions',
    );
    assert(
      this.then,
      '"then" is required',
    );
    assert(
      _.isFunction(this.then),
      '"then" must be a function',
    );
    assert(
      _.isInteger(this.priority),
      '"priority" must be an integer',
    );
    assert(
      _.isBoolean(this.final),
      '"final" must be a boolean',
    );
    assert(
      this.extend.reduce((acc, rule) => acc && (rule instanceof Rule), true),
      '"extend" must be a Rule or an array of Rules',
    );
    assert(
      !this.activationGroup || _.isString(this.activationGroup),
      '"activationGroup" must be a string',
    );
  }
}
