import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { goalAPI } from '../../services/api';
import { Button } from '../../components/common';
import { Target, ArrowLeft, Check, Hash, Percent, Clock, CircleCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const UNITS = [
  { value: 'numeric', label: 'Numeric', hint: 'Count-based targets', icon: Hash },
  { value: 'percentage', label: 'Percentage', hint: 'Percent outcomes', icon: Percent },
  { value: 'timeline', label: 'Timeline', hint: 'Time-bound delivery', icon: Clock },
  { value: 'zero-based', label: 'Zero-based', hint: 'Done (1) or not (0)', icon: CircleCheck },
];

const SMART = [
  { k: 'S', label: 'Specific' },
  { k: 'M', label: 'Measurable' },
  { k: 'A', label: 'Achievable' },
  { k: 'R', label: 'Relevant' },
  { k: 'T', label: 'Time-bound' },
];

const currentYear = new Date().getFullYear();

function FormField({ label, error, children, className = '' }) {
  return (
    <div className={`form-field ${className}`}>
      {label && <label>{label}</label>}
      {children}
      {error && <span className="text-xs font-semibold text-[var(--color-error)]">{error}</span>}
    </div>
  );
}

function FormSection({ icon, title, subtitle, children }) {
  return (
    <section className="form-section-card">
      <header className="form-section-header">
        <span className="form-section-header__icon" aria-hidden>{icon}</span>
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function CycleDonut({ percent }) {
  const r = 56;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(100, Math.max(0, percent)) / 100 * circ;

  return (
    <div className="cycle-donut-wrap">
      <svg width="120" height="120" viewBox="0 0 140 140" className="mx-auto block">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-surface-high)" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>
      <div className="cycle-donut-center">
        <strong>{Math.round(percent)}%</strong>
        <span>Allocated</span>
      </div>
    </div>
  );
}

function CreateGoalSidebar({ existingGoals, weightage }) {
  const usedWeight = existingGoals.reduce((s, g) => s + (g.weightage || 0), 0);
  const w = Number(weightage) || 0;
  const allocated = usedWeight + w;
  const remaining = Math.max(0, 100 - usedWeight - w);

  return (
    <aside className="create-goal-sidebar">
      <div className="form-section-card cycle-overview-card">
        <h3>Cycle overview</h3>
        <CycleDonut percent={allocated} />
        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
          {existingGoals.slice(0, 5).map((g) => (
            <div key={g._id} className="cycle-goal-row">
              <span title={g.title}>{g.title}</span>
              <span>{g.weightage}%</span>
            </div>
          ))}
          {w > 0 && (
            <div className="cycle-goal-row cycle-goal-row--new">
              <span>New goal (draft)</span>
              <span>+{w}%</span>
            </div>
          )}
          {existingGoals.length === 0 && w === 0 && (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-2">No goals yet this year</p>
          )}
        </div>
        <div className="cycle-quota">
          <div className="cycle-quota__row">
            <span>Remaining quota</span>
            <span>{remaining}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-high)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${100 - remaining}%` }}
            />
          </div>
        </div>
      </div>

      <div className="smart-tip-card">
        <h4>SMART goal tip</h4>
        <p>
          Pair a measurable target with a clear description. Managers review goals against team OKRs during
          quarterly check-ins.
        </p>
        <div className="smart-letters">
          {SMART.map(({ k, label }) => (
            <span key={k} title={label}>
              {k}
            </span>
          ))}
        </div>
      </div>

      <div className="info-box text-xs" style={{
        background: 'var(--color-surface-low)',
        padding: '0.75rem 0.875rem',
        borderRadius: '10px',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.55,
      }}>
        <strong className="text-[var(--color-text)]">Guidelines:</strong> Max 8 goals · Min 10% each · Total must equal 100% before submit.
      </div>
    </aside>
  );
}

export default function CreateGoal() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    unit: 'numeric',
    target: '',
    weightage: 10,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingGoals, setExistingGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await goalAPI.getMyGoals();
        const yearGoals = (data.goals || []).filter((g) => g.year === currentYear);
        setExistingGoals(yearGoals);
      } catch {
        /* non-blocking */
      } finally {
        setGoalsLoading(false);
      }
    })();
  }, []);

  const usedWeight = existingGoals.reduce((s, g) => s + (g.weightage || 0), 0);
  const maxWeight = Math.max(10, 100 - usedWeight);

  const step = useMemo(() => {
    if (form.title.trim() && form.target && form.weightage) return 3;
    if (form.title.trim() || form.description.trim()) return 2;
    return 1;
  }, [form]);

  const targetLabel = useMemo(() => {
    switch (form.unit) {
      case 'percentage':
        return 'Target (%)';
      case 'timeline':
        return 'Target (days)';
      case 'zero-based':
        return 'Target (1 = done)';
      default:
        return 'Target value';
    }
  }, [form.unit]);

  const targetPlaceholder = useMemo(() => {
    switch (form.unit) {
      case 'percentage':
        return '40';
      case 'timeline':
        return '30';
      case 'zero-based':
        return '1';
      default:
        return '10';
    }
  }, [form.unit]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Goal title is required';
    if (!form.target || +form.target <= 0) e.target = 'Enter a positive target';
    if (form.unit === 'zero-based' && +form.target !== 1) e.target = 'Zero-based goals use target 1';
    const w = Number(form.weightage);
    if (!w || w < 10) e.weightage = 'Minimum weightage is 10%';
    if (w > maxWeight) e.weightage = `Only ${maxWeight}% available (${usedWeight}% already used)`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await goalAPI.createGoal({
        title: form.title.trim(),
        description: form.description.trim(),
        unit: form.unit,
        target: +form.target,
        weightage: +form.weightage,
      });
      toast.success('Goal created!');
      navigate('/employee/goals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => {
    const value = e.target?.value ?? e;
    setForm((p) => ({ ...p, [k]: value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  return (
    <div className="create-goal-page fade-in">
      <header className="page-toolbar">
        <div className="page-toolbar__main">
          <Link
            to="/employee/goals"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] mb-2 hover:underline"
          >
            <ArrowLeft size={14} />
            Back to My Goals
          </Link>
          <h1>Set new objective</h1>
          <p>Define clear, measurable goals for your {currentYear} performance cycle.</p>
        </div>
      </header>

      <nav className="create-goal-steps" aria-label="Form progress">
        {[
          { n: 1, label: 'Definition' },
          { n: 2, label: 'Metrics' },
          { n: 3, label: 'Review' },
        ].map(({ n, label }) => (
          <div
            key={n}
            className={`create-goal-step ${step === n ? 'is-active' : ''} ${step > n ? 'is-done' : ''}`}
          >
            <span className="create-goal-step__num">{step > n ? <Check size={10} /> : n}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </nav>

      <div className="create-goal-layout">
        <form onSubmit={handleSubmit} className="create-goal-form-col">
          <FormSection icon="📝" title="Goal definition" subtitle="What you want to achieve">
            <div className="form-grid form-grid--2">
              <FormField label="Goal title *" error={errors.title} className="form-grid__full">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Increase quarterly sales conversion"
                  value={form.title}
                  onChange={set('title')}
                />
              </FormField>
              <FormField label="Description" className="form-grid__full">
                <textarea
                  className="input-field input-field--textarea"
                  rows={3}
                  placeholder="Describe the outcome, scope, and success criteria…"
                  value={form.description}
                  onChange={set('description')}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection icon="📊" title="Measurement metrics" subtitle="How progress will be tracked">
            <div className="metrics-split">
              <div>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
                  Unit of measurement *
                </p>
                <div className="uom-selector" role="radiogroup" aria-label="Unit of measurement">
                  {UNITS.map(({ value, label, hint, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={form.unit === value}
                      className={`uom-btn ${form.unit === value ? 'active' : ''}`}
                      onClick={() => setForm((p) => ({ ...p, unit: value }))}
                    >
                      <Icon size={14} strokeWidth={2.25} className="flex-shrink-0" />
                      <span>
                        {label}
                        <span className="uom-btn__hint">{hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <FormField label={`${targetLabel} *`} error={errors.target}>
                  <input
                    type="number"
                    className="input-field"
                    min={1}
                    max={form.unit === 'zero-based' ? 1 : undefined}
                    placeholder={targetPlaceholder}
                    value={form.target}
                    onChange={set('target')}
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
                    onChange={(e) => set('weightage')(e)}
                  />
                  <p className="weight-field__hint">
                    {goalsLoading
                      ? 'Loading quota…'
                      : `${Math.max(0, 100 - usedWeight - Number(form.weightage))}% remaining of 100% cycle`}
                  </p>
                  {errors.weightage && (
                    <span className="text-xs font-semibold text-[var(--color-error)]">{errors.weightage}</span>
                  )}
                </div>
              </div>
            </div>
          </FormSection>

          <footer className="form-actions-bar">
            <p className="form-actions-bar__hint">
              Goals are saved as drafts until you submit all goals for manager approval.
            </p>
            <div className="form-actions-bar__buttons">
              <Button type="button" variant="ghost" onClick={() => navigate('/employee/goals')}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} size="lg" className="min-w-[10rem]">
                <Target size={16} />
                Create goal
              </Button>
            </div>
          </footer>
        </form>

        {!goalsLoading && (
          <CreateGoalSidebar existingGoals={existingGoals} weightage={form.weightage} />
        )}
      </div>
    </div>
  );
}
