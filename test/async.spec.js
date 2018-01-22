const { Rools } = require('..');
const { frank } = require('./facts/users')();
const { rule1, rule2 } = require('./rules/availability');
require('./setup');

describe('Rools.evaluate() / async', () => {
  it('should call async action / action with async/await', async () => {
    const facts = { user: frank };
    const rools = new Rools();
    await rools.register([rule1]);
    await rools.evaluate(facts);
    expect(facts.products).to.deep.equal(['dsl', 'm4g', 'm3g']);
  });

  it('should call async action / action with promises', async () => {
    const facts = { user: frank };
    const rools = new Rools();
    await rools.register([rule2]);
    await rools.evaluate(facts);
    expect(facts.products).to.deep.equal(['dsl', 'm4g', 'm3g']);
  });
});
