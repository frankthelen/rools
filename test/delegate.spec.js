const Delegator = require('../src/Delegator');
require('./setup');

describe('Delegator', () => {
  it('should delegate call', () => {
    const delegator = new Delegator();
    const spy = sinon.spy();
    delegator.set(spy);
    delegator.delegate('bla');
    expect(spy.calledWith('bla')).to.be.equal(true);
  });

  it('should not delegate call if unset', () => {
    const delegator = new Delegator();
    const spy = sinon.spy();
    delegator.set(spy);
    delegator.unset();
    delegator.delegate('bla');
    expect(spy.called).to.be.equal(false);
  });
});
