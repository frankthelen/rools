const Rools = require('../src');
const { frank } = require('./facts/users')();
const { rule1, rule2 } = require('./rules/availability');
require('./setup');

describe('Rules.evaluate() / async', () => {
  it('should call async action / action with async/await', async () => {
    const rools = new Rools({ logging: { debug: true } });
    rools.register(rule1);
    const result = await rools.evaluate({ user: frank });
    console.log(result); // eslint-disable-line no-console
    expect(result.products).to.shallowDeepEqual(['dsl', 'm4g', 'm3g']);
  });

  it('should call async action / action with promises', async () => {
    const rools = new Rools({ logging: { debug: true } });
    rools.register(rule2);
    const result = await rools.evaluate({ user: frank });
    console.log(result); // eslint-disable-line no-console
    expect(result.products).to.shallowDeepEqual(['dsl', 'm4g', 'm3g']);
  });
});
