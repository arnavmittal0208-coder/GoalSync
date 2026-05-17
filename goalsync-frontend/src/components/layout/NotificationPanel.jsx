import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { getNotificationMeta, formatNotificationTime } from '../../constants/notificationTypes';

export default function NotificationPanel({
  open,
  notifications,
  unread,
  onMarkRead,
  onMarkAllRead,
}) {
  const items = notifications.slice(0, 10);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="region"
          aria-label="Notifications"
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="notif-panel"
        >
          <header className="notif-panel__header">
            <div className="notif-panel__header-text">
              <h4 className="notif-panel__title">Notifications</h4>
              <p className="notif-panel__subtitle">
                {unread > 0
                  ? `${unread} unread update${unread === 1 ? '' : 's'}`
                  : 'You are all caught up'}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                className="notif-panel__mark-all"
                onClick={onMarkAllRead}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </header>

          <div className="notif-panel__list">
            {items.length === 0 ? (
              <div className="notif-panel__empty">
                <div className="notif-panel__empty-icon">
                  <BellOff size={22} />
                </div>
                <p className="notif-panel__empty-title">No notifications yet</p>
                <p className="notif-panel__empty-desc">
                  Goal updates, approvals, and reminders will appear here.
                </p>
              </div>
            ) : (
              <ul className="notif-panel__items">
                {items.map((n) => {
                  const meta = getNotificationMeta(n.type);
                  const Icon = meta.icon;
                  return (
                    <li key={n._id}>
                      <button
                        type="button"
                        className={`notif-item ${!n.isRead ? 'notif-item--unread' : ''}`}
                        onClick={() => onMarkRead(n._id)}
                      >
                        <span
                          className={`notif-item__icon notif-item__icon--${meta.tone}`}
                          aria-hidden
                        >
                          <Icon size={16} strokeWidth={2.25} />
                        </span>
                        <span className="notif-item__body">
                          <span className="notif-item__row">
                            <span className="notif-item__title">{n.title}</span>
                            {!n.isRead && <span className="notif-item__dot" aria-label="Unread" />}
                          </span>
                          <span className="notif-item__message">{n.message}</span>
                          <span className="notif-item__meta">
                            <span className="notif-item__type">{meta.label}</span>
                            <span className="notif-item__time">
                              {formatNotificationTime(n.createdAt)}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <footer className="notif-panel__footer">
              <Bell size={13} />
              <span>Showing your {items.length} most recent</span>
            </footer>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
