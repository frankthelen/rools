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
  updated: string[];
  fired: number;
  elapsed: number;
}

export class Rule {
  constructor(opts: RuleOptions);
}

export interface RuleOptions {
  name: string;
  when: Premise | Premise[];
  then: ActionSync | ActionAsync;
  priority?: number;
  final?: boolean;
  extend?: Rule | Rule[];
  activationGroup?: string;
}

export type Premise = (facts: any) => boolean;
export type ActionSync = (facts: any) => void;
export type ActionAsync = (facts: any) => Promise<void>;
