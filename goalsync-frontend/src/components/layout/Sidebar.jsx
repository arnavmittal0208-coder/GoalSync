import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Target, CheckSquare, Users, BarChart3,
  LogOut, TrendingUp, FileText, UserCog, Calendar, Shield, Share2, Plus, X,
} from 'lucide-react';

const NAV = {
  employee: {
    main: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/employee/dashboard' },
      { icon: Target, label: 'My Goals', path: '/employee/goals' },
      { icon: Plus, label: 'Create Goal', path: '/employee/goals/create' },
    ],
    insights: [
      { icon: CheckSquare, label: 'Check-ins', path: '/employee/checkins' },
      { icon: TrendingUp, label: 'Analytics', path: '/employee/analytics' },
    ],
  },
  manager: {
    main: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
      { icon: CheckSquare, label: 'Approvals', path: '/manager/approvals' },
      { icon: Users, label: 'My Team', path: '/manager/team' },
    ],
    insights: [
      { icon: Share2, label: 'Shared Goals', path: '/manager/shared' },
      { icon: BarChart3, label: 'Analytics', path: '/manager/analytics' },
    ],
  },
  admin: {
    main: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: UserCog, label: 'Users', path: '/admin/users' },
    ],
    insights: [
      { icon: FileText, label: 'Reports', path: '/admin/reports' },
      { icon: Shield, label: 'Audit Logs', path: '/admin/audit' },
    ],
  },
};

const ROLE_LABEL = { employee: 'Employee', manager: 'Manager', admin: 'Admin / HR' };

function NavLink({ icon: Icon, label, path, active, onNavigate }) {
  return (
    <Link to={path} onClick={onNavigate} className={`nav-item ${active ? 'is-active' : ''}`}>
      <span className="nav-item-icon-wrap">
        <Icon size={16} strokeWidth={active ? 2.25 : 2} />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const groups = NAV[user?.role] || { main: [], insights: [] };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  const renderGroup = (items) =>
    items.length > 0 && (
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            {...item}
            active={isActive(item.path)}
            onNavigate={onClose}
          />
        ))}
      </div>
    );

  return (
    <aside className={`app-sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      <header className="px-3 pb-5 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="sidebar-logo-name">GoalSync</p>
            <p className="sidebar-logo-sub">Enterprise Edition</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-container)]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <nav className="flex-1 overflow-y-auto px-1 flex flex-col gap-1">
        {renderGroup(groups.main)}
        {groups.insights?.length > 0 && (
          <>
            <p className="nav-section-label mt-3">More</p>
            {renderGroup(groups.insights)}
          </>
        )}
      </nav>

      {user && (
        <div className="flex-shrink-0 border-t border-[var(--color-border)] pt-4 mt-2 px-3 flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary-container)' }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[var(--color-text)] truncate">{user.name}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] capitalize">{ROLE_LABEL[user.role]}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-container)]"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
