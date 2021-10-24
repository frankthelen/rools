export class Rools {
  constructor(opts?: RoolsOptions);
  register(rules: Rule[]): Promise<void>;
  evaluate(facts: Facts, opts?: EvaluateOptions): Promise<EvaluateResult>;
}

export interface RoolsOptions {
  logging?: {
    error?: boolean;
    debug?: boolean;
    delegate?: (item: { level: string, message: string, rule?: string, error?: Error }) => void;
  };
}

export interface EvaluateOptions {
  strategy?: 'ps' | 'sp';
}

export interface EvaluateResult {
  /**
   * @deprecated Please use `accessedByActions` instead.
   */
  updated: SegmentType[]; // deprecated
  accessedByPremises: SegmentType[];
  accessedByActions: SegmentType[];
  fired: number;
  elapsed: number;
}

export type SegmentType = string | symbol;

export class Rule {
  constructor(opts: RuleOptions);
}

export interface RuleOptions {
  name: string;
  when: Premise | Premise[];
  then: Action;
  priority?: number;
  final?: boolean;
  extend?: Rule | Rule[];
  activationGroup?: string;
}

export type Premise = (facts: Facts) => boolean;
export type Action = (facts: Facts) => void | Promise<void>;

export type Facts = any; // eslint-disable-line @typescript-eslint/no-explicit-any
