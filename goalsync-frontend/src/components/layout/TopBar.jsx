import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { Menu, Bell, LogOut, Search, ChevronRight } from 'lucide-react';
import { Avatar, Button } from '../common';
import NotificationPanel from './NotificationPanel';

const ROUTE_LABELS = {
  dashboard: 'Dashboard',
  goals: 'Goals',
  create: 'Create Goal',
  checkins: 'Check-ins',
  analytics: 'Analytics',
  approvals: 'Approvals',
  team: 'Team',
  shared: 'Shared Goals',
  reports: 'Reports',
  users: 'Users',
  cycles: 'Cycles',
  audit: 'Audit Logs',
};

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const role = parts[0];
    const page = parts[parts.length - 1];
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    const pageLabel = ROUTE_LABELS[page] || page.charAt(0).toUpperCase() + page.slice(1);
    return { roleLabel, pageLabel };
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await notificationAPI.getNotifications();
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      } catch {
        /* silent */
      }
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((p) => p.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnread((p) => Math.max(0, p - 1));
    } catch {
      /* silent */
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      /* silent */
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-topbar">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-slate-200/80 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <span className="topbar-brand lg:hidden flex-shrink-0">GoalSync</span>

        {breadcrumb && (
          <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0" aria-label="Breadcrumb">
            <span className="text-slate-400 font-medium">{breadcrumb.roleLabel}</span>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-800 font-semibold truncate">{breadcrumb.pageLabel}</span>
          </nav>
        )}

        <div className="hidden sm:flex flex-1 justify-end lg:justify-start min-w-0 max-w-md">
          <label className="search-pill">
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input type="search" placeholder="Search goals, people, reports…" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotif((p) => !p)}
            className={`notif-trigger ${showNotif ? 'is-open' : ''}`}
            aria-label="Notifications"
            aria-expanded={showNotif}
            aria-haspopup="true"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="notif-trigger__badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          <NotificationPanel
            open={showNotif}
            notifications={notifications}
            unread={unread}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />
        </div>

        <div className="hidden md:flex topbar-profile">
          <Avatar name={user?.name} size="sm" />
          <span className="profile-name">{user?.name}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex !rounded-xl">
          <LogOut size={16} />
          <span className="hidden lg:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
