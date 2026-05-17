import { useState, useEffect } from 'react';
import { goalAPI, checkInAPI } from '../../services/api';
import { Card, StatusBadge, ProgressBar, PageHeader, Button, EmptyState, LoadingSpinner } from '../../components/common';
import CheckInUpdateModal from '../../components/checkins/CheckInUpdateModal';
import { CheckSquare, Plus, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function CheckIns() {
  const [goals, setGoals] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [selQ, setSelQ] = useState('Q2');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ achievement: '', status: 'on-track', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const currentYear = new Date().getFullYear();

  const load = async () => {
    try {
      const [g, c] = await Promise.all([
        goalAPI.getMyGoals(),
        checkInAPI.getMyCheckIns(),
      ]);
      const allGoals = (g.data.goals || []).filter((x) => ['approved', 'locked'].includes(x.status));
      const allCheckIns = c.data.checkIns || [];
      setGoals(allGoals);
      setCheckIns(allCheckIns);

      const availableYears = [...new Set([
        ...allGoals.map((x) => x.year),
        ...allCheckIns.map((x) => x.year),
      ].filter(Boolean))].sort((a, b) => b - a);
      setActiveYear(availableYears[0] || currentYear);
    } catch {
      toast.error('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const yearGoals = goals.filter((g) => g.year === activeYear);
  const yearCheckIns = checkIns.filter((c) => c.year === activeYear);

  const getCI = (goalId, q) =>
    yearCheckIns.find((c) => (c.goalId?._id || c.goalId) === goalId && c.quarter === q);

  const openModal = (goal, q) => {
    const ci = getCI(goal._id, q);
    setFormErrors({});
    setModal({ goal, quarter: q, isEdit: !!ci });
    setForm({
      achievement: ci?.achievement ?? '',
      status: ci?.status || 'on-track',
      notes: ci?.notes || '',
    });
  };

  const validate = () => {
    const e = {};
    const val = form.achievement;
    if (val === '' || val == null || Number(val) < 0) {
      e.achievement = 'Enter your actual achievement';
    }
    if (modal?.goal?.unit === 'zero-based' && val !== '' && ![0, 1].includes(Number(val))) {
      e.achievement = 'Use 0 or 1 for zero-based goals';
    }
    if (!form.status) e.status = 'Select a status';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await checkInAPI.upsertCheckIn({
        goalId: modal.goal._id,
        quarter: modal.quarter,
        year: activeYear,
        achievement: +form.achievement,
        status: form.status,
        notes: form.notes,
      });
      toast.success('Check-in saved!');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading check-ins…" />;

  const qCI = yearCheckIns.filter((c) => c.quarter === selQ);
  const doneCount = qCI.filter((c) => ['completed', 'on-track'].includes(c.status)).length;

  return (
    <div className="fade-in content-stack">
      <PageHeader
        title="Quarterly Check-ins"
        subtitle={`Update your progress for each approved goal · ${activeYear}`}
      />

      <div className="check-ins-quarter-bar" role="tablist" aria-label="Quarter">
        {QUARTERS.map((q) => {
          const count = yearCheckIns.filter((c) => c.quarter === q).length;
          return (
            <button
              key={q}
              type="button"
              role="tab"
              aria-selected={selQ === q}
              className={`check-ins-quarter-bar__btn ${selQ === q ? 'is-active' : ''}`}
              onClick={() => setSelQ(q)}
            >
              {q}
              {count > 0 && <span className="check-ins-quarter-bar__count">{count} saved</span>}
            </button>
          );
        })}
      </div>

      {yearGoals.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[var(--color-text)]">{selQ} progress</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {doneCount} of {yearGoals.length} goals updated
            </p>
          </div>
          <ProgressBar
            value={doneCount}
            max={yearGoals.length}
            showPercent={false}
            height={8}
            color="var(--color-primary)"
          />
        </Card>
      )}

      {yearGoals.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No approved goals"
          subtitle="Your goals need manager approval before you can submit quarterly check-ins."
        />
      ) : (
        <div className="space-y-3">
          {yearGoals.map((g) => {
            const ci = getCI(g._id, selQ);
            const pct = ci ? Math.min(100, Math.round((ci.achievement / g.target) * 100)) : 0;
            return (
              <Card key={g._id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-[var(--color-text)]">{g.title}</h3>
                      <StatusBadge status={ci?.status || 'not-started'} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)] mb-3">
                      <span>
                        Unit: <strong className="text-[var(--color-text)]">{g.unit}</strong>
                      </span>
                      <span>
                        Target: <strong className="text-[var(--color-text)]">{g.target}</strong>
                      </span>
                      <span>
                        Achievement:{' '}
                        <strong className="text-[var(--color-primary)]">
                          {ci?.achievement ?? '—'}
                        </strong>
                      </span>
                    </div>
                    <ProgressBar value={pct} max={100} height={6} label={`${selQ} progress`} />
                    {ci?.notes && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-3 italic leading-relaxed">
                        Note: {ci.notes}
                      </p>
                    )}
                    {ci?.managerComment && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--color-surface-low)] border border-[var(--color-border)]">
                        <p className="text-xs font-semibold text-[var(--color-text)] mb-0.5">
                          Manager feedback
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] italic">
                          &ldquo;{ci.managerComment}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant={ci ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => openModal(g, selQ)}
                    >
                      {ci ? (
                        <>
                          <Pencil size={13} /> Update
                        </>
                      ) : (
                        <>
                          <Plus size={13} /> Add update
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CheckInUpdateModal
        open={!!modal}
        goal={modal?.goal}
        quarter={modal?.quarter}
        form={form}
        setForm={setForm}
        errors={formErrors}
        saving={saving}
        isEdit={modal?.isEdit}
        onClose={() => !saving && setModal(null)}
        onSave={save}
      />
    </div>
  );
}
