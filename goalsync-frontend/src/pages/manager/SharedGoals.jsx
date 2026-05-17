import { useState, useEffect } from 'react';
import { goalAPI, userAPI } from '../../services/api';
import {
  Card,
  StatusBadge,
  PageToolbar,
  Button,
  EmptyState,
  LoadingSpinner,
  ProgressBar,
} from '../../components/common';
import AssignGoalModal from '../../components/goals/AssignGoalModal';
import { Plus, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SharedGoals() {
  const [goals, setGoals] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', unit: 'numeric', target: '', employeeIds: [] });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const [goalsRes, membersRes] = await Promise.all([goalAPI.getTeamGoals(), userAPI.getTeamMembers()]);
      setGoals((goalsRes.data.goals || []).filter((g) => g.isShared));
      setMembers(membersRes.data.members || []);
    } catch {
      toast.error('Failed to load shared goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.target || form.employeeIds.length === 0) {
      toast.error('Fill all required fields and select employees');
      return;
    }
    setSaving(true);
    try {
      await goalAPI.createSharedGoal({ ...form, target: +form.target });
      toast.success('Shared goal assigned!');
      setCreateModal(false);
      setForm({ title: '', description: '', unit: 'numeric', target: '', employeeIds: [] });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleEmployee = (id) => {
    setForm((p) => ({
      ...p,
      employeeIds: p.employeeIds.includes(id) ? p.employeeIds.filter((e) => e !== id) : [...p.employeeIds, id],
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in content-stack">
      <PageToolbar
        title="Shared Goals"
        subtitle="Collaborative objectives assigned to your core team."
        actions={
          <Button onClick={() => setCreateModal(true)}>
            <Plus size={15} />
            Assign goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No shared goals yet"
          subtitle="Assign a shared goal from the button above to align your team on collective objectives."
        />
      ) : (
        <div className="grid-3">
          {goals.map((g) => {
            const progress =
              g.progress ??
              (g.currentValue != null && g.target ? Math.round((g.currentValue / g.target) * 100) : 0);
            const metricLabel = `${g.target} (${g.unit})`;

            return (
              <Card key={g._id} hover>
                <div className="flex justify-between items-start mb-4">
                  <span className="shared-goal-card__chip">Shared</span>
                  <StatusBadge status={g.status} />
                </div>
                <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-2 leading-snug">{g.title}</h3>
                {g.description && (
                  <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 line-clamp-3 leading-relaxed">
                    {g.description}
                  </p>
                )}
                <div className="shared-goal-card__metric mb-4">
                  <p className="shared-goal-card__metric-label">Target metric</p>
                  <p className="shared-goal-card__metric-value">{metricLabel}</p>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1.5">
                    <span>Progress</span>
                    <span className="font-bold text-[var(--color-primary)]">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} showPercent={false} height={6} />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Owner: <strong className="text-[var(--color-text)]">{g.owner?.name || '—'}</strong>
                    {g.weightage != null && (
                      <>
                        {' '}
                        · Weight <strong className="text-[var(--color-primary)]">{g.weightage}%</strong>
                      </>
                    )}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AssignGoalModal
        open={createModal}
        form={form}
        setForm={setForm}
        members={members}
        saving={saving}
        onClose={() => setCreateModal(false)}
        onSave={handleCreate}
      />
    </div>
  );
}
