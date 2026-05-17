import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Card, StatCard, LoadingSpinner, HeroBanner } from '../../components/common';
import { Users, Target, CheckSquare, TrendingUp, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userAPI.getAnalytics();
        setAnalytics(data.analytics);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingSpinner text="Loading organization overview…" />;
  if (!analytics) return null;

  const statusData = (analytics.goalsByStatus || []).map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
    fill: { approved:'#10b981', submitted:'#f59e0b', draft:'var(--color-slate-400, #94a3b8)', rejected:'#ef4444', locked:'#8b5cf6' }[s._id] || 'var(--color-slate-400, #94a3b8)',
  }));

  const deptData  = (analytics.byDept || []).slice(0, 8).map(d => ({ name: d._id || 'Unknown', Employees: d.count }));
  const qData     = (analytics.checkInsByQuarter || []).map(q => ({
    quarter: q._id, Total: q.count, Completed: q.completed,
  }));

  return (
    <div className="fade-in content-stack">
      <HeroBanner
        title="System Overview"
        subtitle="Real-time performance metrics across the organization"
      />

      {/* Stats */}
      <div className="kpi-grid">
        <StatCard title="Total Employees" value={analytics.totalUsers}   icon={Users}      iconColor="var(--color-teal-600, #0d9488)" iconBg="#e2ecf8" />
        <StatCard title="Total Goals"     value={analytics.totalGoals}   icon={Target}     iconColor="#065f46" iconBg="#ecfdf5" />
        <StatCard title="Approved Goals"  value={analytics.approvedGoals} icon={CheckSquare} iconColor="#1e40af" iconBg="#eff6ff" />
        <StatCard title="Pending Approval" value={analytics.pendingGoals} subtitle="Awaiting managers" icon={TrendingUp} iconColor="#92400e" iconBg="#fffbeb"
          trendUp={false} trend={analytics.pendingGoals > 0 ? `${analytics.pendingGoals} pending` : 'All reviewed'} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Goal Status */}
        <Card className="dashboard-card p-5 min-h-[250px]">
          <h2 className="text-base font-semibold text-slate-900 mb-5" className="font-display">
            Goal Status Breakdown
          </h2>
          {statusData.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No data yet</p>
          ) : (
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200, #e2e8f0)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-slate-200, #e2e8f0)', fontSize: 12 }} cursor={{ fill: '#f0f4f8' }} />
                  <Bar dataKey="value" name="Goals" radius={[5,5,0,0]}>
                    {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Department */}
        <Card className="dashboard-card p-5 min-h-[250px]">
          <h2 className="text-base font-semibold text-slate-900 mb-5" className="font-display">
            Employees by Department
          </h2>
          {deptData.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No department data</p>
          ) : (
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200, #e2e8f0)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} width={96} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-slate-200, #e2e8f0)', fontSize: 12 }} cursor={{ fill: '#f0f4f8' }} />
                  <Bar dataKey="Employees" fill="var(--color-teal-600, #0d9488)" radius={[0,5,5,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Quarterly trend */}
      <Card className="dashboard-card p-5 min-h-[242px]">
        <h2 className="text-base font-semibold text-slate-900 mb-5" className="font-display">
          Quarterly Check-in Trends
        </h2>
        {qData.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-8">No check-in data yet</p>
        ) : (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200, #e2e8f0)" vertical={false} />
                <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-slate-200, #e2e8f0)', fontSize: 12 }} />
                <Line type="monotone" dataKey="Total"     stroke="#85e0d4" strokeWidth={2.5} dot={{ fill: '#85e0d4', r: 4, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="Completed" stroke="var(--color-teal-600, #0d9488)" strokeWidth={2.5} dot={{ fill: 'var(--color-teal-600, #0d9488)', r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { to: '/admin/users',   label: 'Manage Users',    sub: `${analytics.totalUsers} registered`, icon: Users },
          { to: '/admin/goals',   label: 'Review All Goals', sub: `${analytics.pendingGoals} pending`,  icon: Target },
          { to: '/admin/reports', label: 'Export Reports',  sub: 'Excel & CSV exports',               icon: TrendingUp },
        ].map(({ to, label, sub, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="p-6 hover:shadow-md hover:border-[var(--color-teal-600, #0d9488)]/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
                </div>
                <div className="flex items-center gap-1 text-teal-600">
                  <Icon size={16} />
                  <ArrowRight size={14} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}



