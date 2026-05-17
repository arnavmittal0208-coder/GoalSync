import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, Trash2, X } from 'lucide-react';

export const Card = ({ children, className = '', onClick, padded = true, hover = false }) => (
  <article
    onClick={onClick}
    className={`ui-card relative overflow-hidden ${padded ? 'ui-card-pad' : ''} ${
      onClick || hover ? 'ui-card--interactive cursor-pointer' : ''
    } ${className}`}
  >
    {children}
  </article>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <header className="card-header">
    <div className="min-w-0">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {action}
  </header>
);

export const StatusBadge = ({ status }) => {
  const config = {
    approved: { bg: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20', dot: 'bg-emerald-500', label: 'Approved' },
    submitted: { bg: 'bg-amber-50 text-amber-800 ring-amber-600/20', dot: 'bg-amber-500', label: 'Submitted' },
    draft: { bg: 'bg-slate-100 text-slate-700 ring-slate-500/10', dot: 'bg-slate-400', label: 'Draft' },
    rejected: { bg: 'bg-red-50 text-red-800 ring-red-600/20', dot: 'bg-red-500', label: 'Rejected' },
    locked: { bg: 'bg-teal-50 text-teal-800 ring-teal-600/20', dot: 'bg-teal-500', label: 'Locked' },
    'on-track': { bg: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20', dot: 'bg-emerald-500', label: 'On Track' },
    'not-started': { bg: 'bg-slate-100 text-slate-700 ring-slate-500/10', dot: 'bg-slate-400', label: 'Not Started' },
    completed: { bg: 'bg-blue-50 text-blue-800 ring-blue-600/20', dot: 'bg-blue-500', label: 'Completed' },
    'at-risk': { bg: 'bg-orange-50 text-orange-800 ring-orange-600/20', dot: 'bg-orange-500', label: 'At Risk' },
    'in-progress': { bg: 'bg-sky-50 text-sky-800 ring-sky-600/20', dot: 'bg-sky-500', label: 'In Progress' },
    active: { bg: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20', dot: 'bg-emerald-500', label: 'Active' },
    inactive: { bg: 'bg-slate-100 text-slate-700 ring-slate-500/10', dot: 'bg-slate-400', label: 'Inactive' },
  };
  const c = config[status] || config.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export const ProgressBar = ({ value = 0, max = 100, showPercent = true, label, height = 8, color }) => {
  const pct = Math.min(100, Math.max(0, Math.round((value / Math.max(max, 1)) * 100)));
  const fill = color || (pct >= 75 ? '#1e7e34' : pct >= 40 ? '#e65100' : '#00685e');
  return (
    <div className="w-full min-w-0">
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2 gap-2">
          {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
          {showPercent && <span className="text-xs font-bold text-slate-700 tabular-nums">{pct}%</span>}
        </div>
      )}
      <div className="w-full rounded-full overflow-hidden bg-[var(--color-surface-high)]" style={{ height: `${height}px` }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: fill }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
};

export const StatCard = ({ title, value, subtitle, icon: Icon, iconColor = '#00685e', trend, trendUp = true, delay = 0 }) => (
  <motion.div
    className="kpi-card"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="flex items-start justify-between gap-3">
      {Icon && <Icon size={26} strokeWidth={1.75} style={{ color: iconColor }} />}
      {trend && (
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            color: trendUp ? '#1e7e34' : '#e65100',
            background: trendUp ? '#e6f4ea' : '#fff3e0',
          }}
        >
          {trend}
        </span>
      )}
    </div>
    <p className="kpi-card__label">{title}</p>
    <p className="kpi-card__value">{value}</p>
    {subtitle && <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>}
  </motion.div>
);

export const Button = ({
  children, variant = 'primary', size = 'md', onClick,
  type = 'button', disabled = false, className = '', loading = false, fullWidth = false,
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
    outline: 'btn-secondary',
    white: 'btn-white',
  };
  const sizes = { xs: 'btn-xs', sm: 'btn-sm', md: '', lg: 'btn-lg' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variants[variant] || 'btn-primary'} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
};

export const Modal = ({ open, onClose, title, subtitle, children, footer, size = 'md' }) => {
  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`relative bg-white rounded-2xl shadow-xl w-full ${maxW[size]} max-h-[90vh] flex flex-col z-10 border border-[var(--color-border)]`}
          >
            <header className="modal-header px-6 py-4 border-b border-[var(--color-border)] rounded-t-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-[var(--color-text)] truncate">{title}</h3>
                  {subtitle && <div className="text-sm text-slate-500 mt-1 truncate">{subtitle}</div>}
                </div>
                <div>
                  <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </header>
            <div className="modal-body px-6 py-5 overflow-y-auto flex-1">{children}</div>
            {footer && <footer className="px-6 py-4 border-t border-slate-100 modal-footer-bar bg-slate-50 rounded-b-2xl">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  preview,
  alertText = 'This action cannot be undone.',
}) => {
  const Icon = variant === 'danger' ? Trash2 : AlertTriangle;
  const iconClass = variant === 'danger' ? 'confirm-dialog__icon--danger' : 'confirm-dialog__icon--warning';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-[3px]"
            onClick={loading ? undefined : onClose}
            aria-label="Close dialog"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="confirm-dialog-modal relative z-10 w-full max-w-[26rem] bg-white rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col"
          >
            <div className="confirm-dialog-panel">
              <span className={`confirm-dialog__icon ${iconClass}`} aria-hidden>
                <Icon size={22} strokeWidth={2} />
              </span>
              <h2 id="confirm-dialog-title" className="confirm-dialog__title">
                {title}
              </h2>
              {description && (
                <p id="confirm-dialog-desc" className="confirm-dialog__desc">
                  {description}
                </p>
              )}
              {preview && (
                <div className="confirm-dialog__preview">
                  <p className="confirm-dialog__preview-label">{preview.label || 'Goal'}</p>
                  <p className="confirm-dialog__preview-title">{preview.title}</p>
                  {preview.meta && <p className="confirm-dialog__preview-meta">{preview.meta}</p>}
                </div>
              )}
              {alertText && (
                <div className="confirm-dialog__alert">
                  <AlertTriangle size={16} className="flex-shrink-0 text-[var(--color-error)] mt-0.5" />
                  <p>{alertText}</p>
                </div>
              )}
            </div>
            <footer className="confirm-dialog-footer">
              <Button variant="ghost" onClick={onClose} disabled={loading} fullWidth className="sm:!w-auto">
                {cancelLabel}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                loading={loading}
                fullWidth
                className="sm:!w-auto"
              >
                {confirmLabel}
              </Button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const Input = ({ label, error, helpText, className = '', ...props }) => (
  <label className={`block space-y-2.5 ${className}`}>
    {label && <span className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">{label}</span>}
    <input {...props} className={`input-field ${error ? '!border-red-400 !ring-red-100/50' : ''} ${props.disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`} />
    {error && <span className="block text-sm text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={14} /> {error}</span>}
    {helpText && !error && <span className="block text-xs text-slate-500">{helpText}</span>}
  </label>
);

export const Select = ({ label, error, options = [], className = '', ...props }) => (
  <label className={`block space-y-2.5 ${className}`}>
    {label && <span className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">{label}</span>}
    <select {...props} className={`input-field cursor-pointer ${error ? '!border-red-400 !ring-red-100/50' : ''}`}>
      {options.map(({ value, label: lbl }) => (
        <option key={value} value={value}>{lbl}</option>
      ))}
    </select>
    {error && <span className="block text-xs text-red-600 font-medium">{error}</span>}
  </label>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
  <label className={`block space-y-2.5 ${className}`}>
    {label && <span className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">{label}</span>}
    <textarea {...props} className={`input-field resize-y min-h-[120px] ${error ? '!border-red-400 !ring-red-100/50' : ''}`} />
    {error && <span className="block text-sm text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={14} /> {error}</span>}
  </label>
);

export const PageToolbar = ({ title, subtitle, actions, breadcrumb, meta }) => (
  <header className="page-toolbar">
    <div className="page-toolbar__main">
      {breadcrumb && <nav className="text-xs font-medium text-slate-500 mb-1.5">{breadcrumb}</nav>}
      {meta}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div className="page-toolbar__actions">{actions}</div>}
  </header>
);

export const PageHeader = PageToolbar;

export const HeroBanner = ({ title, subtitle, action, badge }) => (
  <section className="hero-banner">
    <div>
      {badge && (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-semibold mb-3 backdrop-blur-sm border border-white/20">
          {badge}
        </span>
      )}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </section>
);

export const AlertBanner = ({ variant = 'info', icon: Icon, title, children, action }) => (
  <div className={`alert-banner alert-banner--${variant}`}>
    {Icon && <Icon size={18} className="flex-shrink-0 mt-0.5" />}
    <div className="flex-1 min-w-0">
      {title && <p className="font-semibold mb-0.5">{title}</p>}
      <div className="text-sm opacity-90">{children}</div>
    </div>
    {action}
  </div>
);

export const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <Card className="empty-state-panel" padded>
    <motion.div className="empty-state-panel__inner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {Icon && (
        <span className="empty-state-panel__icon">
          <Icon size={20} strokeWidth={1.75} />
        </span>
      )}
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {action && <div className="empty-state-panel__action">{action}</div>}
    </motion.div>
  </Card>
);

export const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-24">
    <span className="w-11 h-11 rounded-full border-[3px] border-[var(--color-surface-container)] border-t-[var(--color-primary)] animate-spin mb-4" />
    <p className="text-sm font-medium text-slate-500">{text}</p>
  </div>
);

export const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const initials = name.trim().split(/\s+/).map((n) => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  const sizes = { xs: 'w-7 h-7 text-[10px]', sm: 'w-9 h-9 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <span
      className={`rounded-full inline-flex items-center justify-center font-bold leading-none flex-shrink-0 text-teal-700 ring-2 ring-white shadow-sm ${sizes[size]} ${className}`}
      style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary-container)', lineHeight: 1 }}
    >
      {initials}
    </span>
  );
};

export const Badge = ({ children, color = 'teal' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/15',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    red: 'bg-red-50 text-red-700 ring-red-600/15',
    purple: 'bg-violet-50 text-violet-700 ring-violet-600/15',
    gray: 'bg-slate-100 text-slate-600 ring-slate-500/10',
    teal: 'bg-teal-50 text-teal-800 ring-teal-600/15',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

export const Divider = ({ className = '' }) => <hr className={`border-0 h-px bg-slate-200/80 ${className}`} />;

export const SectionTitle = ({ children, action }) => (
  <div className="flex items-center justify-between mb-4 gap-3">
    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{children}</h2>
    {action}
  </div>
);
