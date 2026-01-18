export type Operator = '=' | '!=' | 'like' | 'in' | '>=' | '<=' | 'between';

export interface FilterRule {
  field: string;
  operator: Operator;
  value: any;
}
