import { strict as assert } from 'assert';
import { Rule } from '../src';

describe('new Rule()', () => {
  it('should not fail if properties are correct / minimum', async () => {
    try {
      new Rule({
        name: 'bla',
        when: () => true,
        then: () => {},
      });
    } catch (error) {
      assert.fail();
    }
  });

  it('should not fail if properties are correct / maximum', async () => {
    try {
      new Rule({
        name: 'bla',
        when: () => true,
        then: () => {},
        final: true,
        extend: [new Rule({ name: 'blub', when: () => false, then: () => {} })],
      });
    } catch (error) {
      assert.fail();
    }
  });

  it('should fail if rule has no "name"', async () => {
    try {
      // @ts-ignore
      new Rule({
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
      new Rule({
        // @ts-ignore
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
      // @ts-ignore
      new Rule({
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
      // @ts-ignore
      new Rule({
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
      // @ts-ignore
      new Rule({
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
      new Rule({
        name: 'bla',
        // @ts-ignore
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
      new Rule({
        name: 'bla',
        // @ts-ignore
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
      new Rule({
        name: 'bla',
        when: () => true,
        // @ts-ignore
        then: 'not a function',
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });

  it('should fail if rule "extend" contains not a Rule', async () => {
    try {
      new Rule({
        name: 'bla',
        when: () => true,
        then: () => {},
        // @ts-ignore
        extend: {},
      });
      assert.fail();
    } catch (error) {
      // correct!
    }
  });
});
