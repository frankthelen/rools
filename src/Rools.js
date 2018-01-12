const assert = require('assert');
const md5 = require('md5');
const uniqueid = require('uniqueid');
const Promise = require('bluebird');
const Logger = require('./Logger');
const Delegator = require('./Delegator');
const observe = require('./observe');

class Rools {
  constructor({ logging } = {}) {
    this.actions = [];
    this.premises = [];
    this.premisesByHash = {};
    this.maxPasses = 100; // emergency stop
    this.getActionId = uniqueid('a');
    this.getPremiseId = uniqueid('p');
    this.logger = new Logger(logging);
  }

  async register(...rules) {
    return Promise.try(() => {
      // check all rules -> fail early
      rules.forEach((rule) => {
        this.assertRule(rule);
      });
      // add rules
      rules.forEach((rule) => {
        const {
          name, then, priority = 0, final = false,
        } = rule;
        const action = {
          id: this.getActionId(),
          name, // for logging only
          then,
          priority,
          final,
          premises: [],
        };
        this.actions.push(action);
        const whens = Array.isArray(rule.when) ? rule.when : [rule.when];
        whens.forEach((when, index) => {
          const hash = md5(when); // is function already introduced by other rule?
          let premise = this.premisesByHash[hash];
          if (!premise) { // create new premise
            premise = {
              id: this.getPremiseId(),
              name: `${name} / ${index}`, // for logging only
              when,
              actions: [],
            };
            this.premisesByHash[hash] = premise;
            this.premises.push(premise);
          }
          action.premises.push(premise); // action ->> premises
          premise.actions.push(action); // premise ->> actions
        });
      });
    });
  }

  assertRule(rule) { // eslint-disable-line class-methods-use-this
    assert(rule.name, '"rule.name" is required');
    assert(rule.when, `"rule.when" is required: "${rule.name}"`);
    assert(rule.then, `"rule.then" is required: "${rule.name}"`);
    assert(
      typeof rule.when === 'function' || Array.isArray(rule.when),
      `"rule.when" must be a function or an array of functions: "${rule.name}"`,
    );
    assert(
      typeof rule.then === 'function',
      `"rule.then" must be a function: "${rule.name}"`,
    );
    if (Array.isArray(rule.when)) {
      rule.when.forEach((when, index) => {
        assert(
          typeof when === 'function',
          `"rule.when[${index}]" must be a function: "${rule.name}"`,
        );
      });
    }
  }

  async evaluate(facts) {
    // init
    this.logger.log({ type: 'debug', message: 'evaluate init' });
    const memory = {}; // working memory
    this.actions.forEach((action) => {
      memory[action.id] = { ready: false, fired: false };
    });
    this.premises.forEach((premise) => {
      memory[premise.id] = { value: undefined };
    });
    const delegator = new Delegator();
    const proxy = observe(facts, segment => delegator.delegate(segment));
    const activeSegments = new Set();
    const premisesBySegment = {}; // hash
    // match-resolve-act cycle
    for (let pass = 0; pass < this.maxPasses; pass += 1) {
      const goOn = // eslint-disable-next-line no-await-in-loop
        await this.evaluatePass(proxy, delegator, memory, activeSegments, premisesBySegment, pass);
      if (!goOn) break; // for
    }
    // return facts -- for convenience only
    return facts;
  }

  async evaluatePass(facts, delegator, memory, activeSegments, premisesBySegment, pass) {
    this.logger.log({ type: 'debug', message: `evaluate pass ${pass}` });
    // create agenda for premises
    const premisesAgenda = pass === 0 ? this.premises : new Set();
    if (pass > 0) {
      activeSegments.forEach((segment) => {
        const activePremises = premisesBySegment[segment] || [];
        activePremises.forEach((premise) => { premisesAgenda.add(premise); });
      });
    }
    // evaluate premises
    premisesAgenda.forEach((premise) => {
      try {
        delegator.set((segment) => { // listen to reading fact segments
          this.logger.log({ type: 'debug', message: `read "${segment}"`, rule: premise.name });
          let premises = premisesBySegment[segment];
          if (!premises) {
            premises = new Set();
            premisesBySegment[segment] = premises;
          }
          premises.add(premise); // might grow for "hidden" conditions
        });
        memory[premise.id].value = premise.when(facts); // >>> evaluate premise!
      } catch (error) { // ignore error!
        memory[premise.id].value = undefined;
        this.logger.log({
          type: 'error', message: 'error in premise (when)', rule: premise.name, error,
        });
      } finally {
        delegator.unset();
      }
    });
    // create agenda for actions
    const actionsAgenda = pass === 0 ? this.actions : new Set();
    if (pass > 0) {
      premisesAgenda.forEach((premise) => {
        premise.actions.forEach((action) => {
          if (!memory[action.id].fired) actionsAgenda.add(action);
        });
      });
    }
    // evaluate actions
    actionsAgenda.forEach((action) => {
      const num = action.premises.length;
      const numTrue = action.premises.filter(premise => memory[premise.id].value).length;
      memory[action.id].ready = numTrue === num; // mark ready
    });
    // create conflict set
    const conflictSet = this.actions.filter((action) => {
      const { fired, ready } = memory[action.id];
      return ready && !fired;
    });
    // conflict resolution
    const action = this.evaluateSelect(conflictSet);
    if (!action) {
      this.logger.log({ type: 'debug', message: 'evaluation complete' });
      return false; // done
    }
    // fire action
    this.logger.log({ type: 'debug', message: 'fire action', rule: action.name });
    memory[action.id].fired = true; // mark fired
    try {
      activeSegments.clear(); // reset
      delegator.set((segment) => { // listen to writing fact segments
        this.logger.log({ type: 'debug', message: `write "${segment}"`, rule: action.name });
        activeSegments.add(segment);
      });
      await this.fire(action, facts); // >>> fire action!
    } catch (error) { // re-throw error!
      this.logger.log({
        type: 'error', message: 'error in action (then)', rule: action.name, error,
      });
      throw new Error(`error in action (then): ${action.name}`, error);
    } finally {
      delegator.unset();
    }
    // final rule
    if (action.final) {
      this.logger.log({
        type: 'debug', message: 'evaluation stop after final rule', rule: action.name,
      });
      return false; // done
    }
    // next pass
    return true; // continue
  }

  evaluateSelect(actions) {
    if (actions.length === 0) {
      return undefined; // none
    }
    if (actions.length === 1) {
      return actions[0]; // the one and only
    }
    // conflict resolution
    const prios = actions.map(action => action.priority);
    const highestPrio = Math.max(...prios);
    const actionsWithPrio = actions.filter(action => action.priority === highestPrio);
    this.logger.log({ type: 'debug', message: 'conflict resolution by priority' });
    return actionsWithPrio[0]; // the first one
  }

  async fire(action, facts) { // eslint-disable-line class-methods-use-this
    try {
      const thenable = action.then(facts); // >>> fire action!
      return thenable && thenable.then ? thenable : Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = Rools;
