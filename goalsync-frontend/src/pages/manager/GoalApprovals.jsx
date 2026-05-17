import { useState, useEffect } from 'react';
import { goalAPI } from '../../services/api';
import { Card, StatusBadge, Avatar, Button, Modal, Input, Textarea, EmptyState, LoadingSpinner, PageHeader } from '../../components/common';
import { CheckSquare, ThumbsUp, ThumbsDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'submitted', label: 'Pending' },
  { key: 'approved',  label: 'Approved' },
  { key: 'rejected',  label: 'Rejected' },
  { key: 'all',       label: 'All Goals' },
];

export default function GoalApprovals() {
  const [goals,   setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('submitted');
  const [modal,   setModal]   = useState(null); // { goal, type }
  const [comment, setComment] = useState('');
  const [editTgt, setEditTgt] = useState('');
  const [editWt,  setEditWt]  = useState('');
  const [saving,  setSaving]  = useState(false);
  const [search,  setSearch]  = useState('');

  const load = async () => {
    try {
      const { data } = await goalAPI.getTeamGoals();
      setGoals(data.goals || []);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const counts = {
    submitted: goals.filter(g => g.status === 'submitted').length,
    approved:  goals.filter(g => ['approved','locked'].includes(g.status)).length,
    rejected:  goals.filter(g => g.status === 'rejected').length,
    all:       goals.length,
  };

  const filtered = goals.filter(g => {
    const matchTab = tab === 'all' ? true
      : tab === 'approved' ? ['approved','locked'].includes(g.status)
      : g.status === tab;
    const matchSearch = !search
      || g.title.toLowerCase().includes(search.toLowerCase())
      || g.owner?.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const openModal = (goal, type) => {
    setModal({ goal, type });
    setComment(goal.managerComment || '');
    setEditTgt(goal.target);
    setEditWt(goal.weightage);
  };

  const handleAction = async () => {
    setSaving(true);
    try {
      if (modal.type === 'approve') {
        await goalAPI.approveGoal(modal.goal._id, { comment, target: +editTgt, weightage: +editWt });
        toast.success('Goal approved!');
      } else {
        await goalAPI.rejectGoal(modal.goal._id, { comment });
        toast.success('Goal returned for revision');
      }
      setModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading goal approvals…" />;

  return (
    <div className="fade-in content-stack">
      <PageHeader
        title="Goal Approvals"
        subtitle="Review and approve submitted goals from your team"
      />

      {/* Tabs + search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="tab-bar" role="tablist">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`tab-bar__item ${tab === key ? 'is-active' : ''}`}
            >
              {label}
              <span className="opacity-70 ml-1">({counts[key]})</span>
            </button>
          ))}
        </div>
        <div className="search-pill flex-1 lg:max-w-xs lg:ml-auto">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search goals or names…"
          />
        </div>
      </div>

      {/* Goal cards */}
      {filtered.length === 0 ? (
        <EmptyState icon={CheckSquare}
          title={tab === 'submitted' ? 'No pending approvals' : 'No goals found'}
          subtitle={tab === 'submitted' ? 'Your team has no goals awaiting review.' : 'Try adjusting your search or filter.'} />
      ) : (
        <div className="space-y-3">
          {filtered.map(g => (
            <Card key={g._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Owner info */}
                <div className="flex items-center gap-6 sm:flex-col sm:items-center sm:w-20 flex-shrink-0">
                  <Avatar name={g.owner?.name || ''} size="md" />
                  <div className="sm:text-center sm:mt-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{g.owner?.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-600 truncate">{g.owner?.designation}</p>
                  </div>
                </div>

                {/* Goal details */}
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900">{g.title}</h3>
                      <StatusBadge status={g.status} />
                      {g.isShared && <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 whitespace-nowrap">Shared</span>}
                    </div>
                  </div>

                  {g.description && (
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{g.description}</p>
                  )}

                  <div className="flex flex-wrap gap-6 text-xs">
                    {[['Unit', g.unit], ['Target', g.target], ['Weightage', `${g.weightage}%`]].map(([k, v]) => (
                      <span key={k} className="text-slate-600">
                        {k}: <strong className="text-slate-700">{v}</strong>
                      </span>
                    ))}
                  </div>

                  {g.managerComment && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#f8fafc] border border-[var(--color-slate-200, #e2e8f0)]">
                      <p className="text-xs text-slate-600 italic">💬 {g.managerComment}</p>
                    </div>
                  )}
                </div>

                {/* Approve / reject */}
                {g.status === 'submitted' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="success" onClick={() => openModal(g, 'approve')}>
                      <ThumbsUp size={13} /> Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => openModal(g, 'reject')}>
                      <ThumbsDown size={13} /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Action modal */}
      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal?.type === 'approve' ? '✅ Approve Goal' : '↩️ Return for Revision'}
        footer={<>
          <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant={modal?.type === 'approve' ? 'success' : 'danger'} onClick={handleAction} loading={saving}>
            {modal?.type === 'approve' ? 'Confirm Approval' : 'Send for Revision'}
          </Button>
        </>}>
        <div className="space-y-6">
          <div className="p-6.5 rounded-xl bg-[#f8fafc] border border-[var(--color-slate-200, #e2e8f0)]">
            <p className="text-sm font-semibold text-slate-900">{modal?.goal?.title}</p>
            <p className="text-xs text-slate-600 mt-0.5">{modal?.goal?.owner?.name} · {modal?.goal?.owner?.designation}</p>
          </div>

          {modal?.type === 'approve' && (
            <div className="grid grid-cols-2 gap-6">
              <Input label="Target (edit if needed)" type="number"
                value={editTgt} onChange={e => setEditTgt(e.target.value)} />
              <Input label="Weightage (%)" type="number" min="10" max="100"
                value={editWt} onChange={e => setEditWt(e.target.value)} />
            </div>
          )}

          <Textarea
            label={`Comment${modal?.type === 'reject' ? ' (required — explain what to change)' : ' (optional)'}`}
            rows={3} value={comment} onChange={e => setComment(e.target.value)}
            placeholder={modal?.type === 'approve' ? 'Any notes for the employee…' : 'Explain what needs to be revised…'} />
        </div>
      </Modal>
    </div>
  );
}



