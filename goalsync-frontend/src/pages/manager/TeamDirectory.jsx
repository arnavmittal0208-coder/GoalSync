import { useState, useEffect } from 'react';
import { userAPI, checkInAPI } from '../../services/api';
import { Card, Avatar, StatusBadge, ProgressBar, Button, Modal, Textarea, EmptyState, LoadingSpinner, PageHeader } from '../../components/common';
import { Users, Mail, Phone, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeamDirectory() {
  const [members,  setMembers]  = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [fbModal,  setFbModal]  = useState(null);
  const [comment,  setComment]  = useState('');
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    try {
      const [m, c] = await Promise.all([
        userAPI.getTeamMembers(),
        checkInAPI.getTeamCheckIns({ year: new Date().getFullYear() }),
      ]);
      setMembers(m.data.members || []);
      setCheckIns(c.data.checkIns || []);
    } catch { toast.error('Failed to load team'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const saveFeedback = async () => {
    if (!comment.trim()) { toast.error('Please add a comment'); return; }
    setSaving(true);
    try {
      await checkInAPI.addManagerComment(fbModal._id, { comment });
      toast.success('Feedback saved!');
      setFbModal(null);
      setComment('');
      load();
    } catch { toast.error('Failed to save feedback'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading team directory…" />;

  return (
    <div className="fade-in content-stack">
      <PageHeader
        title="My Team"
        subtitle={`${members.length} member${members.length !== 1 ? 's' : ''} · ${new Date().getFullYear()} Performance Year`}
      />

      {members.length === 0 ? (
        <EmptyState icon={Users} title="No team members"
          subtitle="No employees are currently assigned to you as manager." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {members.map(member => {
            const mc = checkIns.filter(c => (c.employeeId?._id || c.employeeId) === member._id);
            const completed = mc.filter(c => c.status === 'completed').length;
            const onTrack   = mc.filter(c => c.status === 'on-track').length;
            const rate = mc.length > 0 ? Math.round(((completed + onTrack) / mc.length) * 100) : 0;

            return (
              <Card key={member._id} className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar name={member.name} size="lg" />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">{member.name}</h3>
                    <p className="text-xs text-slate-600 truncate mt-1">{member.designation}</p>
                    <span className="inline-block mt-2 px-2.5 py-1 text-[10px] font-semibold rounded-md bg-teal-50 text-teal-700">
                      {member.department || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Check-ins', val: mc.length },
                    { label: 'On Track', val: onTrack },
                    { label: 'Done', val: completed },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center p-2 rounded-xl bg-[#f8fafc] border border-[var(--color-slate-200, #e2e8f0)]">
                      <p className="text-base font-bold text-slate-900">{val}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <ProgressBar value={rate} max={100} label="Performance Rate" height={5} />
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={11} className="flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={11} className="flex-shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.joinDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={11} className="flex-shrink-0" />
                      <span>Joined {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {/* Recent check-ins */}
                {mc.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Recent Check-ins</p>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {mc.slice(0, 3).map(ci => (
                        <div key={ci._id} className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafc] border border-[var(--color-slate-200, #e2e8f0)] group">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-medium text-slate-900 truncate">{ci.goalId?.title || 'Goal'}</p>
                            <p className="text-[10px] text-slate-600">{ci.quarter} · {ci.achievement} / {ci.goalId?.target}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <StatusBadge status={ci.status} />
                            <button onClick={() => { setFbModal(ci); setComment(ci.managerComment || ''); }}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--color-slate-400, #94a3b8)] hover:text-teal-600 hover:bg-[#e2ecf8] opacity-0 group-hover:opacity-100 transition-all">
                              <MessageSquare size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Feedback modal */}
      <Modal open={!!fbModal} onClose={() => setFbModal(null)} title="Add Manager Feedback"
        footer={<>
          <Button variant="ghost" onClick={() => setFbModal(null)}>Cancel</Button>
          <Button variant="primary" onClick={saveFeedback} loading={saving}>Save Feedback</Button>
        </>}>
        <div className="space-y-6">
          <div className="p-6.5 rounded-xl bg-[#f8fafc] border border-[var(--color-slate-200, #e2e8f0)]">
            <p className="text-sm font-semibold text-slate-900">{fbModal?.goalId?.title || 'Goal'}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {fbModal?.quarter} · Achievement: {fbModal?.achievement} / {fbModal?.goalId?.target}
            </p>
          </div>
          <Textarea label="Your Feedback" rows={4} value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share specific feedback, praise, or improvement suggestions…" />
        </div>
      </Modal>
    </div>
  );
}



