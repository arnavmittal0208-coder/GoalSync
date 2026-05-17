import { useState, useEffect } from 'react';
import { goalAPI, checkInAPI, userAPI } from '../../services/api';
import { Card, StatCard, Avatar, PageHeader, LoadingSpinner, ProgressBar } from '../../components/common';
import { Users, TrendingUp, Target, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function TeamAnalytics() {
  const [teamGoals, setTeamGoals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [goalsRes, membersRes, ciRes] = await Promise.all([
          goalAPI.getTeamGoals(),
          userAPI.getTeamMembers(),
          checkInAPI.getTeamCheckIns(),
        ]);
        const allGoals = goalsRes.data.goals || [];
        const allCheckIns = ciRes.data.checkIns || [];
        setTeamGoals(allGoals);
        setTeamMembers(membersRes.data.members || []);
        setCheckIns(allCheckIns);

        const availableYears = [...new Set([
          ...allGoals.map(x => x.year),
          ...allCheckIns.map(x => x.year),
        ].filter(Boolean))].sort((a, b) => b - a);
        setActiveYear(availableYears[0] || new Date().getFullYear());
      } catch { toast.error('Failed to load team analytics'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  const yearGoals = teamGoals.filter(g => g.year === activeYear);
  const yearCheckIns = checkIns.filter(c => c.year === activeYear);

  const memberMetrics = teamMembers.map(m => {
    const mg = yearGoals.filter(g => (g.owner?._id || g.owner) === m._id);
    const mc = yearCheckIns.filter(c => (c.employeeId?._id || c.employeeId) === m._id);
    const completed = mc.filter(c => c.status === 'completed').length;
    const onTrack = mc.filter(c => c.status === 'on-track').length;
    const rate = mc.length > 0 ? Math.round((completed / mc.length) * 100) : 0;
    return { name: m.name.split(' ')[0], totalGoals: mg.length, completed, onTrack, rate, member: m };
  });

  const quarterData = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
    const qci = yearCheckIns.filter(c => c.quarter === q);
    return {
      quarter: q,
      total: qci.length,
      completed: qci.filter(c => c.status === 'completed').length,
      onTrack: qci.filter(c => c.status === 'on-track').length,
    };
  });

  return (
    <div className="fade-in content-stack">
      <PageHeader title="Team Analytics" subtitle={`Monitor your team's performance and progress across all goals · ${activeYear}`} />

      <div className="kpi-grid">
        <StatCard title="Team Members" value={teamMembers.length} icon={Users} color="var(--color-teal-600, #0d9488)" bg="#e5eeff" />
        <StatCard title="Team Goals" value={yearGoals.length} icon={Target} color="var(--color-teal-700, #0f766e)" bg="#dcfce7" />
        <StatCard title="Check-ins" value={yearCheckIns.length} icon={CheckSquare} color="#1d4ed8" bg="#dbeafe" />
        <StatCard title="Avg Completion" value={`${memberMetrics.length > 0 ? Math.round(memberMetrics.reduce((s, m) => s + m.rate, 0) / memberMetrics.length) : 0}%`} icon={TrendingUp} color="#934529" bg="#ffdbd0" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="dashboard-card p-6 min-h-[250px]">
          <h2 className="text-lg font-semibold text-slate-900 mb-4" className="font-display">Quarterly Team Performance</h2>
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={quarterData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5eeff' }} />
              <Bar dataKey="total" name="Total" fill="#85f6e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="var(--color-teal-700, #0f766e)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="dashboard-card p-6 min-h-[250px]">
          <h2 className="text-lg font-semibold text-slate-900 mb-4" className="font-display">Member Performance</h2>
          <div className="space-y-6">
            {memberMetrics.map((m, i) => (
              <div key={i} className="flex items-center gap-6">
                <Avatar name={m.member.name} size="sm" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-900">{m.name}</span>
                    <span className="font-bold text-teal-600">{m.rate}%</span>
                  </div>
                  <ProgressBar value={m.rate} max={100} showPercent={false} />
                </div>
              </div>
            ))}
            {memberMetrics.length === 0 && <p className="text-sm text-slate-600 text-center py-4">No team members assigned</p>}
          </div>
        </Card>
      </div>

      {/* Member Details Table */}
      <Card className="dashboard-card">
        <div className="table-scroll">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[#e5eeff]">
                {['Member', 'Goals', 'Completed', 'On Track', 'Completion Rate'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memberMetrics.map((m, i) => (
                <tr key={i} className="border-b border-[#f8f9ff] hover:bg-[#f8f9ff] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-6">
                      <Avatar name={m.member.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{m.member.name}</p>
                        <p className="text-xs text-slate-600">{m.member.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-700">{m.totalGoals}</td>
                  <td className="px-4 py-3 text-sm font-mono text-[var(--color-teal-700, #0f766e)] font-bold">{m.completed}</td>
                  <td className="px-4 py-3 text-sm font-mono text-teal-600">{m.onTrack}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.rate}%`, background: m.rate >= 70 ? 'var(--color-teal-700, #0f766e)' : m.rate >= 40 ? '#d97706' : '#ba1a1a' }} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{m.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {memberMetrics.length === 0 && (
                <tr><td colSpan={5} className="text-center text-sm text-slate-600 py-8">No team data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}



