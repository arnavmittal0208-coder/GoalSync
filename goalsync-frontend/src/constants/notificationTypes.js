import {
  CheckCircle2,
  XCircle,
  Send,
  Users,
  CalendarClock,
  Unlock,
  Lock,
  Info,
  Bell,
} from 'lucide-react';

export const NOTIFICATION_TYPE_META = {
  goal_approved: {
    label: 'Goal approved',
    icon: CheckCircle2,
    tone: 'success',
  },
  goal_rejected: {
    label: 'Goal rejected',
    icon: XCircle,
    tone: 'danger',
  },
  goal_submitted: {
    label: 'Submission',
    icon: Send,
    tone: 'info',
  },
  shared_goal: {
    label: 'Shared goal',
    icon: Users,
    tone: 'primary',
  },
  checkin_reminder: {
    label: 'Check-in',
    icon: CalendarClock,
    tone: 'warning',
  },
  goal_unlocked: {
    label: 'Unlocked',
    icon: Unlock,
    tone: 'info',
  },
  goal_locked: {
    label: 'Locked',
    icon: Lock,
    tone: 'muted',
  },
  system: {
    label: 'System',
    icon: Info,
    tone: 'muted',
  },
};

export function getNotificationMeta(type) {
  return (
    NOTIFICATION_TYPE_META[type] || {
      label: 'Update',
      icon: Bell,
      tone: 'muted',
    }
  );
}

export function formatNotificationTime(date) {
  if (!date) return '';
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return '';

  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
