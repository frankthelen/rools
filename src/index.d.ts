export class Rools {
  constructor(opts?: RoolsOptions);
  register(rules: Rule[]): Promise<void>;
  evaluate(facts: any, opts?: EvaluateOptions): Promise<EvaluateResult>;
}

export interface RoolsOptions {
  logging?: {
    error?: boolean;
    debug?: boolean;
    delegate?: (params: { level: string, message: string, rule?: string, error?: Error }) => void;
  };
}

export interface EvaluateOptions {
  strategy?: "ps" | "sp";
}

export interface EvaluateResult {
  /**
   * @deprecated Please use `accessedByActions` instead.
   */
  updated: string[]; // deprecated
  accessedByPremises: string[];
  accessedByActions: string[];
  fired: number;
  elapsed: number;
}

export class Rule {
  constructor(opts: RuleOptions);
}

export class RuleError {
  constructor(message: string, error: Error);
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

export type Premise = (facts: any) => boolean;
export type Action = (facts: any) => void | Promise<void>;
