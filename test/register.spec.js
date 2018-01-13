const assert = require('assert');
const { ruleMoodGreat: rule } = require('./rules/mood');
const Rools = require('..');
require('./setup');

describe('Rules.register()', () => {
  let rools;

  before(() => {
    rools = new Rools();
  });

  it('should not fail if rules are correct', async () => {
    try {
      await rools.register({ ...rule });
    } catch (error) {
      assert.fail(error);
    }
  });

  it('should fail if rule has no "name"', async () => {
    try {
      await rools.register({ ...rule, name: undefined });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule has no "when"', async () => {
    try {
      await rools.register({ ...rule, when: undefined });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule has no "then"', async () => {
    try {
      await rools.register({ ...rule, then: undefined });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "when" is neither function nor array', async () => {
    try {
      await rools.register({ ...rule, when: 'not a function' });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "when" is an array with a non-function element', async () => {
    try {
      await rools.register({ ...rule, when: ['not a function'] });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "then" is not a function', async () => {
    try {
      await rools.register({ ...rule, then: 'not a function' });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });
});
