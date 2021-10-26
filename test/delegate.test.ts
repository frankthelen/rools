import Delegator from '../src/Delegator';

describe('Delegator', () => {
  it('should delegate call', () => {
    const delegator = new Delegator();
    const spy = jest.fn();
    delegator.set(spy);
    delegator.delegate('bla');
    expect(spy).toHaveBeenCalledWith('bla');
  });

  it('should not delegate call if unset', () => {
    const delegator = new Delegator();
    const spy = jest.fn();
    delegator.set(spy);
    delegator.unset();
    delegator.delegate('bla');
    expect(spy).not.toHaveBeenCalled();
  });
});
