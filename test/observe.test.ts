import observe from '../src/observe';

const object = {
  prop: true,
  sub: {
    subsub: {
      bla: true,
    },
  },
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

describe('observe', () => {
  it('should notify on reading property', () => {
    const spy = jest.fn();
    const proxy = observe(object, spy);
    // @ts-ignore
    const temp = proxy.prop;
    expect(spy).toHaveBeenCalledWith('prop');
  });

  it('should notify on writing property', () => {
    const spy = jest.fn();
    const proxy = observe(object, spy);
    // @ts-ignore
    proxy.prop = false;
    expect(spy).toHaveBeenCalledWith('prop');
  });

  it('should notify on deleting property', () => {
    const spy = jest.fn();
    const proxy = observe(object, spy);
    // @ts-ignore
    delete proxy.prop;
    expect(spy).toHaveBeenCalledWith('prop');
  });

  it('should notify on reading sub-property', () => {
    const spy = jest.fn();
    const proxy = observe(object, spy);
    // @ts-ignore
    const temp = proxy.sub.subsub.bla;
    expect(spy).toHaveBeenCalledWith('sub');
  });

  it('should notify on writing sub-property', () => {
    const spy = jest.fn();
    const proxy = observe(object, spy);
    // @ts-ignore
    proxy.sub.subsub.bla = false;
    expect(spy).toHaveBeenCalledWith('sub');
  });

  it('should notify on deleting sub-property', () => {
    const spy = jest.fn();
    const proxy = observe(object, spy);
    // @ts-ignore
    delete proxy.sub.subsub.bla;
    expect(spy).toHaveBeenCalledWith('sub');
  });
});
