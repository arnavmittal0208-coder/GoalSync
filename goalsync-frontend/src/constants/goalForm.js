import { Hash, Percent, Clock, CircleCheck } from 'lucide-react';

export const GOAL_UNITS = [
  { value: 'numeric', label: 'Numeric', hint: 'Count-based', icon: Hash },
  { value: 'percentage', label: 'Percentage', hint: 'Percent', icon: Percent },
  { value: 'timeline', label: 'Timeline', hint: 'Time-bound', icon: Clock },
  { value: 'zero-based', label: 'Zero-based', hint: 'Done / not done', icon: CircleCheck },
];

export function targetLabelForUnit(unit) {
  switch (unit) {
    case 'percentage':
      return 'Target (%)';
    case 'timeline':
      return 'Target (days)';
    case 'zero-based':
      return 'Target (1 = done)';
    default:
      return 'Target value';
  }
}

export function targetPlaceholderForUnit(unit) {
  switch (unit) {
    case 'percentage':
      return '40';
    case 'timeline':
      return '30';
    case 'zero-based':
      return '1';
    default:
      return '10';
  }
}
