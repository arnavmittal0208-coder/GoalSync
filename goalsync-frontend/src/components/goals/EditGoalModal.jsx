import { AnimatePresence, motion } from 'framer-motion';
import { X, Info, Save } from 'lucide-react';
import { Button, StatusBadge } from '../common';
import { GOAL_UNITS, targetLabelForUnit, targetPlaceholderForUnit } from '../../constants/goalForm';

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

export default function EditGoalModal({
  open,
  goal,
  form,
  setForm,
  onClose,
  onSave,
  saving = false,
  errors = {},
  maxWeightage = 100,
  usedWeightExcludingCurrent = 0,
}) {
  if (!goal) return null;

  const maxWeight = Math.max(10, maxWeightage);
  const remaining = Math.max(0, 100 - usedWeightExcludingCurrent - (Number(form.weightage) || 0));
  const isShared = goal.isShared;

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
            aria-labelledby="edit-goal-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="edit-goal-modal"
          >
            <header className="edit-goal-modal__header">
              <div className="edit-goal-modal__header-top">
                <div className="min-w-0 flex-1">
                  <h2 id="edit-goal-title" className="edit-goal-modal__title">
                    Update goal
                  </h2>
                  <p className="edit-goal-modal__subtitle">{goal.title}</p>
                </div>
                <button
                  type="button"
                  className="edit-goal-modal__close"
                  onClick={onClose}
                  disabled={saving}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="edit-goal-modal__badges">
                <StatusBadge status={goal.status} />
                {isShared && (
                  <span className="shared-goal-card__chip">Shared</span>
                )}
              </div>
            </header>

            <div className="edit-goal-modal__body">
              {isShared ? (
                <div className="edit-goal-modal__notice edit-goal-modal__notice--shared">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <p>
                    Shared goals are managed by your team lead. You can only adjust your
                    weightage for this objective.
                  </p>
                </div>
              ) : (
                <div className="edit-goal-modal__notice">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <p>Changes apply to this draft only. Submit all goals when weightage totals 100%.</p>
                </div>
              )}

              {isShared ? (
                <FormSection title="Weightage">
                  <div className="form-field">
                    <div className="weight-field__head">
                      <label>Weightage</label>
                      <span className="weight-field__value">{form.weightage}%</span>
                    </div>
                    <input
                      type="range"
                      className="weight-slider"
                      min={10}
                      max={maxWeight}
                      step={5}
                      value={Math.min(Number(form.weightage) || 10, maxWeight)}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, weightage: +e.target.value }))
                      }
                    />
                    <p className="weight-field__hint">{remaining}% remaining in your cycle quota</p>
                    {errors.weightage && (
                      <span className="text-xs font-semibold text-[var(--color-error)]">
                        {errors.weightage}
                      </span>
                    )}
                  </div>
                </FormSection>
              ) : (
                <>
                  <FormSection title="Goal details">
                    <div className="form-grid form-grid--2 gap-3">
                      <FormField label="Goal title *" error={errors.title} className="form-grid__full">
                        <input
                          type="text"
                          className="input-field"
                          value={form.title || ''}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, title: e.target.value }))
                          }
                        />
                      </FormField>
                      <FormField label="Description" className="form-grid__full">
                        <textarea
                          className="input-field input-field--textarea"
                          rows={3}
                          value={form.description || ''}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, description: e.target.value }))
                          }
                        />
                      </FormField>
                    </div>
                  </FormSection>

                  <FormSection title="Measurement">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
                          Unit
                        </p>
                        <div className="uom-selector" role="radiogroup">
                          {GOAL_UNITS.map(({ value, label, hint, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={form.unit === value}
                              className={`uom-btn ${form.unit === value ? 'active' : ''}`}
                              onClick={() => setForm((p) => ({ ...p, unit: value }))}
                            >
                              <Icon size={14} strokeWidth={2.25} />
                              <span>
                                {label}
                                <span className="uom-btn__hint">{hint}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField
                          label={`${targetLabelForUnit(form.unit)} *`}
                          error={errors.target}
                        >
                          <input
                            type="number"
                            className="input-field"
                            min={1}
                            max={form.unit === 'zero-based' ? 1 : undefined}
                            placeholder={targetPlaceholderForUnit(form.unit)}
                            value={form.target ?? ''}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, target: +e.target.value }))
                            }
                          />
                        </FormField>

                        <div className="form-field">
                          <div className="weight-field__head">
                            <label>Weightage</label>
                            <span className="weight-field__value">{form.weightage}%</span>
                          </div>
                          <input
                            type="range"
                            className="weight-slider"
                            min={10}
                            max={maxWeight}
                            step={5}
                            value={Math.min(Number(form.weightage) || 10, maxWeight)}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, weightage: +e.target.value }))
                            }
                          />
                          <p className="weight-field__hint">
                            {remaining}% remaining · max {maxWeight}% for this goal
                          </p>
                          {errors.weightage && (
                            <span className="text-xs font-semibold text-[var(--color-error)]">
                              {errors.weightage}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </FormSection>
                </>
              )}
            </div>

            <footer className="edit-goal-modal__footer">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={onSave} loading={saving} size="md">
                <Save size={15} />
                Save changes
              </Button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
