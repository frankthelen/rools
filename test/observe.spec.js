const observe = require('../src/observe');
require('./setup');

const object = {
  prop: true,
  sub: {
    subsub: {
      bla: true,
    },
  },
};

describe('observe', () => {
  it('should notify on reading property', () => {
    const spy = sinon.spy();
    const proxy = observe(object, spy);
    const temp = proxy.prop; // eslint-disable-line no-unused-vars
    expect(spy.calledWith('prop')).to.be.equal(true);
  });

  it('should notify on writing property', () => {
    const spy = sinon.spy();
    const proxy = observe(object, spy);
    proxy.prop = false;
    expect(spy.calledWith('prop')).to.be.equal(true);
  });

  it('should notify on deleting property', () => {
    const spy = sinon.spy();
    const proxy = observe(object, spy);
    delete proxy.prop;
    expect(spy.calledWith('prop')).to.be.equal(true);
  });

  it('should notify on reading sub-property', () => {
    const spy = sinon.spy();
    const proxy = observe(object, spy);
    const temp = proxy.sub.subsub.bla; // eslint-disable-line no-unused-vars
    expect(spy.calledWith('sub')).to.be.equal(true);
  });

  it('should notify on writing sub-property', () => {
    const spy = sinon.spy();
    const proxy = observe(object, spy);
    proxy.sub.subsub.bla = false;
    expect(spy.calledWith('sub')).to.be.equal(true);
  });

  it('should notify on deleting sub-property', () => {
    const spy = sinon.spy();
    const proxy = observe(object, spy);
    delete proxy.sub.subsub.bla;
    expect(spy.calledWith('sub')).to.be.equal(true);
  });
});
