import md5 from 'md5';
import { Rools, Rule } from '../src';

describe('Rools.register() / optimization of premises', () => {
  it('should not merge premises if not identical', async () => {
    const rule1 = new Rule({
      name: 'rule1',
      when: (facts: any) => facts.user.name === 'frank',
      then: () => {},
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: (facts: any) => facts.user.name === 'michael',
      then: () => {},
    });
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    // @ts-ignore
    expect(rools.rules.premises.length).toEqual(2);
  });

  it('should merge premises if identical / reference / arrow function', async () => {
    const isFrank = (facts: any) => facts.user.name === 'frank';
    const rule1 = new Rule({
      name: 'rule1',
      when: isFrank,
      then: () => {},
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: isFrank,
      then: () => {},
    });
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    // @ts-ignore
    expect(rools.rules.premises.length).toEqual(1);
  });

  it('should merge premises if identical / reference / classic function', async () => {
    function isFrank(facts: any) {
      return facts.user.name === 'frank';
    }
    const rule1 = new Rule({
      name: 'rule1',
      when: isFrank,
      then: () => {},
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: isFrank,
      then: () => {},
    });
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    // @ts-ignore
    expect(rools.rules.premises.length).toEqual(1);
  });

  it('should merge premises if identical / hash / arrow function', async () => {
    const rule1 = new Rule({
      name: 'rule1',
      when: (facts: any) => facts.user.name === 'frank',
      then: () => {},
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: (facts: any) => facts.user.name === 'frank',
      then: () => {},
    });
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    // @ts-ignore
    expect(rools.rules.premises.length).toEqual(1);
  });

  it('should merge premises if identical / hash / classic function()', async () => {
    const rule1 = new Rule({
      name: 'rule1',
      when: function p(facts: any) {
        return facts.user.name === 'frank';
      },
      then: () => {},
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: function p(facts: any) {
        return facts.user.name === 'frank';
      },
      then: () => {},
    });
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    // @ts-ignore
    expect(rools.rules.premises.length).toEqual(1);
  });

  it('should not merge premises if identical / hash / slightly different (unfortunately)', async () => {
    const rule1 = new Rule({
      name: 'rule1',
      when: (facts: any) => facts.user.name === 'frank',
      then: () => {},
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: (facts: any) => facts.user.name === "frank", // eslint-disable-line @typescript-eslint/quotes
      then: () => {},
    });
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    // @ts-ignore
    expect(rools.rules.premises.length).toEqual(2);
  });

  it('should not merge premises if not identical / with Date object', async () => {
    const date1 = new Date('2000-01-01');
    const date2 = new Date('1990-01-01');
    const rule1 = new Rule({
      name: 'rule1',
      when: (facts: any) => facts.user.birthdate > date1,
      then: () => {},
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: (facts: any) => facts.user.birthdate > date2,
      then: () => {},
    });
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    // @ts-ignore
    expect(rools.rules.premises.length).toEqual(2);
  });

  it('should merge premises if identical / with Date object', async () => {
    const date = new Date('2000-01-01');
    const rule1 = new Rule({
      name: 'rule1',
      when: (facts: any) => facts.user.birthdate > date,
      then: () => {},
    });
    const rule2 = new Rule({
      name: 'rule2',
      when: (facts: any) => facts.user.birthdate > date,
      then: () => {},
    });
    const rools = new Rools();
    await rools.register([rule1, rule2]);
    // @ts-ignore
    expect(rools.rules.premises.length).toEqual(1);
  });

  it('should merge premises if identical / fn.toString() / 1', async () => {
    const foo = ({ context }: any) => context.bar === 'buz0';
    const fns = [
      ({ context }: any) => context.bar === 'buz0',
      ({ context }: any) => context.bar === 'buz 0',
      ({ context }: any) => context.bar === 'buz 0',
      ({ context }: any) => context.bar === 'buz10',
      ({ context }: any) => context.bar === 'buz00',
      foo,
      foo,
      ({ context }: any) => context.bar === 'buz0',
    ];
    const set = new Set();
    fns.forEach((f) => set.add(md5(f.toString())));
    expect(set.size).toEqual(4);
  });

  it('should merge premises if identical / fn.toString() / 2', async () => {
    const foo = ({ context }: any) => context.bar === Math.abs(3);
    const fns = [
      ({ context }: any) => context.bar === Math.abs(0),
      ({ context }: any) => context.bar === Math.abs(1),
      foo,
    ];
    const set = new Set();
    fns.forEach((f) => set.add(md5(f.toString())));
    expect(set.size).toEqual(3);
  });
});
