import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { goalAPI, userAPI, checkInAPI } from '../../services/api';
import { Card, StatCard, Avatar, LoadingSpinner, HeroBanner, Button } from '../../components/common';
import { Users, CheckSquare, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PIE_COLORS = { approved: '#10b981', submitted: '#f59e0b', draft: 'var(--color-slate-400, #94a3b8)', rejected: '#ef4444', locked: '#8b5cf6' };

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [teamGoals, setTeamGoals] = useState([]);
  const [members,   setMembers]   = useState([]);
  const [checkIns,  setCheckIns]  = useState([]);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [g, m, c] = await Promise.all([
          goalAPI.getTeamGoals(),
          userAPI.getTeamMembers(),
          checkInAPI.getTeamCheckIns(),
        ]);
        const allGoals = g.data.goals || [];
        const allCheckIns = c.data.checkIns || [];
        setTeamGoals(allGoals);
        setMembers(m.data.members || []);
        setCheckIns(allCheckIns);

        const availableYears = [...new Set([
          ...allGoals.map(x => x.year),
          ...allCheckIns.map(x => x.year),
        ].filter(Boolean))].sort((a, b) => b - a);
        setActiveYear(availableYears[0] || new Date().getFullYear());
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingSpinner text="Loading team dashboard…" />;

  const yearGoals = teamGoals.filter(g => g.year === activeYear);
  const yearCheckIns = checkIns.filter(c => c.year === activeYear);

  const pending  = yearGoals.filter(g => g.status === 'submitted');
  const approved = yearGoals.filter(g => ['approved','locked'].includes(g.status));
  const completedCI = yearCheckIns.filter(c => c.status === 'completed');
  const completionRate = yearCheckIns.length > 0 ? Math.round((completedCI.length / yearCheckIns.length) * 100) : 0;

  // Pie data
  const pieData = Object.entries(
    yearGoals.reduce((acc, g) => { acc[g.status] = (acc[g.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: PIE_COLORS[name] || 'var(--color-slate-400, #94a3b8)' }));

  // Bar data: per member
  const barData = members.slice(0, 6).map(m => {
    const mg = yearGoals.filter(g => (g.owner?._id || g.owner) === m._id);
    const mc = yearCheckIns.filter(c => (c.employeeId?._id || c.employeeId) === m._id);
    return {
      name: m.name.split(' ')[0],
      Goals: mg.length,
      Completed: mc.filter(c => c.status === 'completed').length,
    };
  });

  return (
    <div className="fade-in content-stack">
      <HeroBanner
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Manager'}!`}
        subtitle={`${members.length} team members · ${pending.length} pending approvals · ${activeYear} cycle`}
        action={
          <Link to="/manager/approvals">
            <Button variant="white" size="md">Quick Review</Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="kpi-grid">
        <StatCard title="Team Members"    value={members.length}    icon={Users}      iconColor="var(--color-teal-600, #0d9488)" iconBg="#e2ecf8" />
        <StatCard title="Pending Approval" value={pending.length}   subtitle="Need your review" icon={Clock} iconColor="#92400e" iconBg="#fffbeb"
          trend={pending.length > 0 ? `${pending.length} waiting` : 'All reviewed'} trendUp={false} />
        <StatCard title="Total Goals"     value={yearGoals.length}  icon={CheckSquare} iconColor="#065f46" iconBg="#ecfdf5" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} iconColor="#1e40af" iconBg="#eff6ff"
          trend={`${completedCI.length} of ${yearCheckIns.length} check-ins done`} trendUp={completionRate >= 50} />
      </div>

      {/* Pending approvals + Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Pending list */}
        <Card className="dashboard-card lg:col-span-3 p-5 min-h-[312px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900" className="font-display">
                Pending Approvals
              </h2>
              {pending.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                  {pending.length}
                </span>
              )}
            </div>
            <Link to="/manager/approvals" className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] flex items-center justify-center mx-auto mb-3">
                <CheckSquare size={18} className="text-[#10b981]" />
              </div>
              <p className="text-sm font-medium text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-600 mt-1">No goals pending review</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 5).map(g => (
                <div key={g._id} className="flex items-start gap-6 p-6 rounded-xl bg-[#f8fafc] border border-[var(--color-slate-200, #e2e8f0)] hover:bg-[#f0f4f8] transition-colors">
                  <Avatar name={g.owner?.name || ''} size="sm" className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 leading-tight">{g.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{g.owner?.name} · {g.weightage}% weight</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pie chart */}
        <Card className="dashboard-card lg:col-span-2 p-5 min-h-[312px]">
          <h2 className="text-base font-semibold text-slate-900 mb-4" className="font-display">
            Goal Distribution
          </h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No goals yet</p>
          ) : (
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={52} outerRadius={75}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-slate-200, #e2e8f0)', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 11, color: 'var(--color-slate-700, #334155)' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Team bar chart */}
      <Card className="dashboard-card p-5 min-h-[242px]">
        <h2 className="text-base font-semibold text-slate-900 mb-5" className="font-display">
          Team Member Progress
        </h2>
        {barData.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-8">No team members assigned</p>
        ) : (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={20} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200, #e2e8f0)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-slate-200, #e2e8f0)', fontSize: 12 }} cursor={{ fill: '#f0f4f8' }} />
                <Bar dataKey="Goals"     fill="#85e0d4" radius={[4,4,0,0]} />
                <Bar dataKey="Completed" fill="var(--color-teal-600, #0d9488)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}



