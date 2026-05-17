import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { goalAPI } from '../../services/api';
import { Card, StatusBadge, PageHeader, Button, ConfirmDialog, EmptyState, LoadingSpinner } from '../../components/common';
import EditGoalModal from '../../components/goals/EditGoalModal';
import { Target, Plus, Trash2, Send, Lock, Edit2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyGoals() {
  const [goals,      setGoals]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [editGoal,   setEditGoal]   = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [updating,   setUpdating]   = useState(false);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();

  const load = async () => {
    try {
      const { data } = await goalAPI.getMyGoals();
      const allGoals = data.goals || [];
      setGoals(allGoals);
      const years = [...new Set(allGoals.map(x => x.year).filter(Boolean))].sort((a, b) => b - a);
      setActiveYear(years[0] || currentYear);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const yearGoals = goals.filter(g => g.year === activeYear);
  const totalWt  = yearGoals.reduce((s, g) => s + g.weightage, 0);
  const drafts   = yearGoals.filter(g => g.status === 'draft');
  const canSubmit = drafts.length > 0 && totalWt === 100;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await goalAPI.submitGoals();
      toast.success('Goals submitted for approval!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Submit failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await goalAPI.deleteGoal(deleteTarget._id);
      toast.success('Goal deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (g) => {
    setEditErrors({});
    setEditGoal(g);
    setEditForm({
      title: g.title,
      description: g.description || '',
      unit: g.unit,
      target: g.target,
      weightage: g.weightage,
    });
  };

  const usedWeightExcluding = (goalId) =>
    yearGoals.filter((g) => g._id !== goalId).reduce((s, g) => s + (g.weightage || 0), 0);

  const validateEdit = () => {
    const e = {};
    if (!editGoal?.isShared) {
      if (!editForm.title?.trim()) e.title = 'Title is required';
      if (!editForm.target || +editForm.target <= 0) e.target = 'Enter a valid target';
      if (editForm.unit === 'zero-based' && +editForm.target !== 1) {
        e.target = 'Zero-based goals use target 1';
      }
    }
    const w = Number(editForm.weightage);
    const maxW = 100 - usedWeightExcluding(editGoal?._id);
    if (!w || w < 10) e.weightage = 'Minimum weightage is 10%';
    if (w > maxW) e.weightage = `Maximum ${maxW}% available for this goal`;
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateEdit()) return;
    setUpdating(true);
    try {
      await goalAPI.updateGoal(editGoal._id, editForm);
      toast.success('Goal updated');
      setEditGoal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading goals…" />;

  const wtColor = totalWt === 100 ? '#10b981' : totalWt > 100 ? '#ef4444' : '#f59e0b';

  const STATUS_ORDER = ['draft','submitted','approved','locked','rejected'];
  const sorted = [...yearGoals].sort((a,b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  return (
    <div className="fade-in content-stack">
      <PageHeader
        title="My Goals"
        subtitle={`${activeYear} performance goals · ${yearGoals.length} of 8`}
        actions={<div className="flex items-center gap-2 flex-wrap">
          {drafts.length > 0 && (
            <Button onClick={handleSubmit} loading={submitting} disabled={!canSubmit} variant="primary">
              <Send size={15} /> Submit for Approval
            </Button>
          )}
          {yearGoals.length < 8 && (
            <Link to="/employee/goals/create">
              <Button variant="outline"><Plus size={15} /> Add Goal</Button>
            </Link>
          )}
        </div>}
      />

      {/* Weightage meter */}
      {yearGoals.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Total Weightage</p>
              <p className="text-xs text-slate-600 mt-0.5">Must equal 100% to submit · Min 10% per goal</p>
            </div>
            <span className="text-2xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: wtColor }}>
              {totalWt}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#e2ecf8] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, totalWt)}%`, background: wtColor }} />
          </div>
          {totalWt !== 100 && drafts.length > 0 && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: wtColor }}>
              {totalWt < 100 ? `Need ${100 - totalWt}% more` : `Reduce by ${totalWt - 100}%`} to enable submission
            </p>
          )}
        </Card>
      )}

      {/* Goals list */}
      {sorted.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet"
          subtitle="Create your first performance goal using Add Goal above. You can add up to 8 goals per year." />
      ) : (
        <div className="space-y-3">
          {sorted.map(g => (
            <Card key={g._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-slate-900">{g.title}</h3>
                    <StatusBadge status={g.status} />
                    {g.isShared && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 whitespace-nowrap">Shared</span>
                    )}
                    {g.isLocked && <Lock size={12} className="text-violet-500" />}
                  </div>

                  {/* Description */}
                  {g.description && (
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{g.description}</p>
                  )}

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-6">
                    {[
                      ['Unit', g.unit],
                      ['Target', g.target],
                      ['Weightage', `${g.weightage}%`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-[var(--color-slate-400, #94a3b8)] uppercase">{k}</span>
                        <span className="text-xs font-semibold text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Manager comment */}
                  {g.managerComment && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-[var(--color-surface-low)] border border-[var(--color-border)]">
                      <Info size={13} className="text-slate-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 italic">"{g.managerComment}"</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {g.status === 'draft' && !g.isLocked && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container)] transition-colors"
                      aria-label={`Edit ${g.title}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(g)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-[#ffdad6]/50 transition-colors"
                      aria-label={`Delete ${g.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this goal?"
        description="The goal will be permanently removed from your performance cycle."
        confirmLabel="Delete goal"
        cancelLabel="Keep goal"
        loading={deleting}
        preview={
          deleteTarget
            ? {
                label: 'Draft goal',
                title: deleteTarget.title,
                meta: `${deleteTarget.weightage}% weight · ${deleteTarget.unit} target: ${deleteTarget.target}`,
              }
            : null
        }
        alertText="You cannot recover a deleted goal. Your total weightage will update accordingly."
      />

      <EditGoalModal
        open={!!editGoal}
        goal={editGoal}
        form={editForm}
        setForm={setEditForm}
        errors={editErrors}
        saving={updating}
        onClose={() => !updating && setEditGoal(null)}
        onSave={handleUpdate}
        maxWeightage={editGoal ? 100 - usedWeightExcluding(editGoal._id) : 100}
        usedWeightExcludingCurrent={editGoal ? usedWeightExcluding(editGoal._id) : 0}
      />
    </div>
  );
}
