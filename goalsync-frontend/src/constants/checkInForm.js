import { Circle, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

export const CHECK_IN_STATUSES = [
  { value: 'not-started', label: 'Not started', hint: 'Work not begun', icon: Circle },
  { value: 'on-track', label: 'On track', hint: 'Progressing well', icon: TrendingUp },
  { value: 'completed', label: 'Completed', hint: 'Target met', icon: CheckCircle2 },
  { value: 'at-risk', label: 'At risk', hint: 'Needs attention', icon: AlertTriangle },
];

export function achievementLabelForUnit(unit) {
  switch (unit) {
    case 'percentage':
      return 'Actual achievement (%)';
    case 'timeline':
      return 'Actual achievement (days)';
    case 'zero-based':
      return 'Completion (0 or 1)';
    default:
      return 'Actual achievement';
  }
}

export function achievementPlaceholder(goal) {
  const target = goal?.target || 10;
  switch (goal?.unit) {
    case 'percentage':
      return String(Math.min(100, Math.round(target * 0.7)));
    case 'zero-based':
      return '1';
    default:
      return String(Math.round(target * 0.7));
  }
}
