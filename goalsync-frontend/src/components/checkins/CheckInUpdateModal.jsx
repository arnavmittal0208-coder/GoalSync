import { AnimatePresence, motion } from 'framer-motion';
import { X, Info, Save, Target } from 'lucide-react';
import { Button, StatusBadge } from '../common';
import {
  CHECK_IN_STATUSES,
  achievementLabelForUnit,
  achievementPlaceholder,
} from '../../constants/checkInForm';

function FormField({ label, error, children, className = '' }) {
  return (
    <div className={`form-field ${className}`}>
      {label && <label>{label}</label>}
      {children}
      {error && <span className="text-xs font-semibold text-[var(--color-error)]">{error}</span>}
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="form-section-card !p-4 !shadow-none">
      <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)] mb-3">
        {title}
      </h4>
      {children}
    </section>
  );
}

export default function CheckInUpdateModal({
  open,
  goal,
  quarter,
  form,
  setForm,
  onClose,
  onSave,
  saving = false,
  errors = {},
  isEdit = false,
}) {
  if (!goal || !quarter) return null;

  const target = Number(goal.target) || 1;
  const achievement = form.achievement === '' ? null : Number(form.achievement);
  const progressPct =
    achievement != null && achievement >= 0
      ? Math.min(100, Math.round((achievement / target) * 100))
      : null;

  const progressColor =
    progressPct == null
      ? 'var(--color-primary)'
      : progressPct >= 100
        ? '#10b981'
        : progressPct >= 70
          ? 'var(--color-primary)'
          : progressPct >= 40
            ? '#f59e0b'
            : '#ef4444';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-[3px]"
            onClick={saving ? undefined : onClose}
            aria-label="Close"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="check-in-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="check-in-modal"
          >
            <header className="check-in-modal__header">
              <div className="check-in-modal__header-top">
                <div className="min-w-0 flex-1">
                  <p className="check-in-modal__quarter">
                    {quarter} · {isEdit ? 'Update' : 'New check-in'}
                  </p>
                  <h2 id="check-in-modal-title" className="check-in-modal__title">
                    {goal.title}
                  </h2>
                </div>
                <button
                  type="button"
                  className="check-in-modal__close"
                  onClick={onClose}
                  disabled={saving}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="check-in-modal__badges">
                <StatusBadge status={form.status || 'on-track'} />
                <span className="check-in-modal__meta-chip">{goal.weightage}% weight</span>
                <span className="check-in-modal__meta-chip">{goal.unit}</span>
              </div>
            </header>

            <div className="check-in-modal__body">
              <div className="check-in-modal__target-card">
                <div className="check-in-modal__target-icon">
                  <Target size={18} />
                </div>
                <div>
                  <p className="check-in-modal__target-label">Goal target</p>
                  <p className="check-in-modal__target-value">
                    {goal.target}
                    <span className="check-in-modal__target-unit">{goal.unit}</span>
                  </p>
                </div>
              </div>

              <div className="check-in-modal__notice">
                <Info size={16} className="flex-shrink-0 mt-0.5" />
                <p>
                  Record your actual progress for {quarter}. Your manager can review this during
                  performance conversations.
                </p>
              </div>

              <FormSection title="Progress">
                <FormField
                  label={achievementLabelForUnit(goal.unit)}
                  error={errors.achievement}
                >
                  <input
                    type="number"
                    className="input-field"
                    min={0}
                    max={goal.unit === 'percentage' ? 100 : goal.unit === 'zero-based' ? 1 : undefined}
                    step={goal.unit === 'zero-based' ? 1 : 'any'}
                    value={form.achievement}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, achievement: e.target.value }))
                    }
                    placeholder={achievementPlaceholder(goal)}
                  />
                </FormField>

                {progressPct != null && (
                  <div className="check-in-modal__progress-preview">
                    <div className="check-in-modal__progress-head">
                      <span>Progress vs target</span>
                      <strong style={{ color: progressColor }}>{progressPct}%</strong>
                    </div>
                    <div className="check-in-modal__progress-track">
                      <div
                        className="check-in-modal__progress-fill"
                        style={{ width: `${progressPct}%`, background: progressColor }}
                      />
                    </div>
                  </div>
                )}
              </FormSection>

              <FormSection title="Status">
                <div className="check-in-status-grid" role="radiogroup" aria-label="Check-in status">
                  {CHECK_IN_STATUSES.map(({ value, label, hint, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={form.status === value}
                      className={`check-in-status-btn ${form.status === value ? 'is-active' : ''} check-in-status-btn--${value}`}
                      onClick={() => setForm((p) => ({ ...p, status: value }))}
                    >
                      <span className="check-in-status-btn__icon">
                        <Icon size={16} strokeWidth={2.25} />
                      </span>
                      <span className="check-in-status-btn__text">
                        {label}
                        <span className="check-in-status-btn__hint">{hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </FormSection>

              <FormSection title="Notes">
                <FormField label="Context (optional)" error={errors.notes}>
                  <textarea
                    className="input-field input-field--textarea"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Blockers, wins, or next steps your manager should know…"
                  />
                </FormField>
              </FormSection>
            </div>

            <footer className="check-in-modal__footer">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={onSave} loading={saving} size="md">
                <Save size={15} />
                Save check-in
              </Button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
