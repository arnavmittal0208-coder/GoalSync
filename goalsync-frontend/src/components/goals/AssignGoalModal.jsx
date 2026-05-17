import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Share2, Target, Hash, Percent, Clock, CheckSquare, Info, Users } from 'lucide-react';
import { Button } from '../common';

const UNITS = [
  { value: 'numeric',    label: 'Numeric',    hint: 'e.g. count, tasks',  Icon: Hash },
  { value: 'percentage', label: 'Percentage', hint: 'e.g. completion %',  Icon: Percent },
  { value: 'timeline',   label: 'Timeline',   hint: 'e.g. days, sprints', Icon: Clock },
  { value: 'zero-based', label: 'Zero-based', hint: 'achieved / not yet', Icon: CheckSquare },
];

function FormField({ label, error, children }) {
  return (
    <div className="form-field">
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

export default function AssignGoalModal({ open, form, setForm, members = [], saving = false, onClose, onSave }) {
  const toggleEmployee = (id) => {
    setForm((p) => ({
      ...p,
      employeeIds: p.employeeIds.includes(id)
        ? p.employeeIds.filter((e) => e !== id)
        : [...p.employeeIds, id],
    }));
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-[3px]"
            onClick={saving ? undefined : onClose}
            aria-label="Close"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-goal-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="assign-goal-modal"
          >
            {/* Header */}
            <header className="assign-goal-modal__header">
              <div className="assign-goal-modal__header-top">
                <div className="min-w-0 flex-1">
                  <p className="assign-goal-modal__eyebrow">Shared Goal · New Assignment</p>
                  <h2 id="assign-goal-modal-title" className="assign-goal-modal__title">
                    Assign Shared Goal
                  </h2>
                </div>
                <button
                  type="button"
                  className="assign-goal-modal__close"
                  onClick={onClose}
                  disabled={saving}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="assign-goal-modal__badges">
                <span className="assign-goal-modal__meta-chip"><Share2 size={11} /> Shared Goal</span>
                {form.unit && <span className="assign-goal-modal__meta-chip">{form.unit}</span>}
                {form.employeeIds.length > 0 && (
                  <span className="assign-goal-modal__meta-chip assign-goal-modal__meta-chip--active">
                    <Users size={11} /> {form.employeeIds.length} selected
                  </span>
                )}
              </div>
            </header>

            {/* Body */}
            <div className="assign-goal-modal__body">
              <div className="assign-goal-modal__notice">
                <Info size={15} className="flex-shrink-0 mt-0.5" />
                <p>Shared goals are visible to all assigned team members and contribute to their collective performance score.</p>
              </div>

              <FormSection title="Goal Details">
                <div className="form-grid form-grid--1 gap-3">
                  <FormField label="Goal Title *">
                    <input
                      type="text"
                      className="input-field"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g., Q3 Delivery Excellence"
                    />
                  </FormField>
                  <FormField label="Description (optional)">
                    <textarea
                      className="input-field input-field--textarea"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Add context about why this goal matters…"
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Target Metrics">
                <div className="uom-selector mb-3">
                  {UNITS.map(({ value, label, hint, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={`uom-btn ${form.unit === value ? 'active' : ''}`}
                      onClick={() => setForm((p) => ({ ...p, unit: value }))}
                    >
                      <Icon size={14} />
                      <span>{label}<span className="uom-btn__hint">{hint}</span></span>
                    </button>
                  ))}
                </div>
                <FormField label="Target Value *">
                  <input
                    type="number"
                    className="input-field"
                    value={form.target}
                    onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
                    placeholder="e.g., 95"
                    min={0}
                  />
                </FormField>
                {form.target && (
                  <div className="assign-goal-modal__target-card">
                    <div className="assign-goal-modal__target-icon"><Target size={17} /></div>
                    <div>
                      <p className="assign-goal-modal__target-label">Target</p>
                      <p className="assign-goal-modal__target-value">
                        {form.target}<span className="assign-goal-modal__target-unit">{form.unit}</span>
                      </p>
                    </div>
                  </div>
                )}
              </FormSection>

              <FormSection title="Assign to Team Members *">
                {members.length === 0 ? (
                  <div className="assign-goal-modal__empty">
                    <Users size={24} className="mb-2 opacity-40" />
                    <p>No team members available</p>
                  </div>
                ) : (
                  <div className="assign-goal-member-list">
                    {members.map((m) => {
                      const selected = form.employeeIds.includes(m._id);
                      return (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => toggleEmployee(m._id)}
                          className={`assign-goal-member-btn ${selected ? 'is-selected' : ''}`}
                        >
                          <div className={`assign-goal-member-btn__avatar ${selected ? 'is-selected' : ''}`}>
                            {m.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="assign-goal-member-btn__info">
                            <p className="assign-goal-member-btn__name">{m.name}</p>
                            <p className="assign-goal-member-btn__role">{m.designation}</p>
                          </div>
                          <div className={`assign-goal-member-btn__check ${selected ? 'is-selected' : ''}`}>
                            {selected && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </FormSection>
            </div>

            {/* Footer */}
            <footer className="assign-goal-modal__footer">
              <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button onClick={onSave} loading={saving} size="md">
                <Share2 size={15} /> Assign to Team
              </Button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
