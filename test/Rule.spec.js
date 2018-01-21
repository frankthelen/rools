const assert = require('assert');
const { Rule } = require('..');
require('./setup');

/* eslint-disable no-unused-vars */

describe('new Rule()', () => {
  it('should not fail if properties are correct / minimum', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        when: () => true,
        then: () => {},
      });
    } catch (error) {
      assert.fail(error);
    }
  });

  it('should not fail if properties are correct / maximum', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        when: () => true,
        then: () => {},
        final: true,
        extend: [new Rule({ name: 'blub', when: () => false, then: () => {} })],
      });
    } catch (error) {
      assert.fail(error);
    }
  });

  it('should fail if rule has no "name"', async () => {
    try {
      const rule = new Rule({
        when: () => true,
        then: () => {},
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if "name" is not a string', async () => {
    try {
      const rule = new Rule({
        name: () => {},
        when: () => true,
        then: () => {},
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule has no "when"', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        then: () => {},
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule has no "then"', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        when: () => true,
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "when" is empty', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        when: [],
        then: () => {},
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "when" is neither function nor array', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        when: 'not a function',
        then: () => {},
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "when" is an array with a non-function element', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        when: ['not a function'],
        then: () => {},
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "then" is not a function', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        when: () => true,
        then: 'not a function',
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "extend" contains not a Rule', async () => {
    try {
      const rule = new Rule({
        name: 'bla',
        when: () => true,
        then: () => {},
        extend: {},
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });
});
