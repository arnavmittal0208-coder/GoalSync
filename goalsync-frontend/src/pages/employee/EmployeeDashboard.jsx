import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { goalAPI, checkInAPI } from '../../services/api';
import { Card, CardHeader, StatCard, ProgressBar, StatusBadge, LoadingSpinner, HeroBanner, Button, AlertBanner } from '../../components/common';
import { Target, TrendingUp, CheckSquare, Clock, ArrowRight, AlertTriangle, Plus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [goals,    setGoals]    = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [loading,  setLoading]  = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      try {
        const [g, c] = await Promise.all([
          goalAPI.getMyGoals(),
          checkInAPI.getMyCheckIns(),
        ]);
        const allGoals = g.data.goals || [];
        const allCheckIns = c.data.checkIns || [];
        setGoals(allGoals);
        setCheckIns(allCheckIns);

        const availableYears = [...new Set([
          ...allGoals.map(x => x.year),
          ...allCheckIns.map(x => x.year),
        ].filter(Boolean))].sort((a, b) => b - a);
        setActiveYear(availableYears[0] || currentYear);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard…" />;

  const yearGoals = goals.filter(g => g.year === activeYear);
  const yearCheckIns = checkIns.filter(c => c.year === activeYear);

  const approved = yearGoals.filter(g => ['approved','locked'].includes(g.status));
  const submitted = yearGoals.filter(g => g.status === 'submitted');
  const drafts    = yearGoals.filter(g => g.status === 'draft');
  const totalWt   = yearGoals.reduce((s, g) => s + g.weightage, 0);

  // Weighted overall progress
  const overallPct = approved.length === 0 ? 0 : Math.round(
    approved.reduce((s, g) => {
      const ci = yearCheckIns.filter(c => (c.goalId?._id || c.goalId) === g._id);
      const latest = ci.sort((a,b) => ['Q4','Q3','Q2','Q1'].indexOf(a.quarter) - ['Q4','Q3','Q2','Q1'].indexOf(b.quarter))[0];
      const pct = latest ? Math.min(100, (latest.achievement / g.target) * 100) : 0;
      return s + (pct * g.weightage / 100);
    }, 0)
  );

  const quarterData = QUARTERS.map((q) => {
    const qci = yearCheckIns.filter(c => c.quarter === q);
    const onTrack   = qci.filter(c => c.status === 'on-track').length;
    const completed = qci.filter(c => c.status === 'completed').length;
    return { quarter: q, 'On Track': onTrack, Completed: completed, total: qci.length };
  });
  const hasQuarterData = quarterData.some(x => x.total > 0);

  const progressBarColor = overallPct >= 75 ? '#10b981' : overallPct >= 40 ? '#f59e0b' : '#00685e';

  return (
    <div className="content-stack">
      <HeroBanner
        badge={`${activeYear} Performance Cycle`}
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}!`}
        subtitle={`${user?.designation || 'Team Member'} · ${user?.department || 'Department'} · ${submitted.length} goal${submitted.length !== 1 ? 's' : ''} pending review`}
        action={
          <Link to="/employee/goals/create">
            <Button variant="white" size="md"><Plus size={16} /> New Goal</Button>
          </Link>
        }
      />

      {/* Draft alert */}
      {drafts.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={17} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              {drafts.length} draft goal{drafts.length > 1 ? 's' : ''} need attention
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Total weightage: <strong>{totalWt}%</strong>
              {totalWt !== 100 ? ` — add ${Math.abs(100 - totalWt)}% more ${totalWt > 100 ? '(over)' : ''}` : ' — ready to submit!'}
            </p>
          </div>
          <Link to="/employee/goals" className="text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap">
            View →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="kpi-grid">
        <StatCard delay={0} title="Total Goals" value={yearGoals.length} subtitle="of 8 allowed" icon={Target} iconColor="#00685e" />
        <StatCard delay={0.05} title="Approved" value={approved.length} subtitle="Active & locked" icon={CheckSquare} iconColor="#059669" />
        <StatCard delay={0.1} title="Pending Review" value={submitted.length} subtitle="Awaiting manager" icon={Clock} iconColor="#d97706" />
        <StatCard delay={0.15} title="Progress" value={`${overallPct}%`} subtitle="Weighted completion" icon={TrendingUp} iconColor="#00685e"
          trend={overallPct >= 50 ? 'On track' : 'Needs focus'} trendUp={overallPct >= 50} />
      </div>

      {/* Main grid */}
      <div className="grid-2-1">

        {/* Goal progress list */}
        <Card className="dashboard-card p-5 min-h-[356px]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#0d1f2d]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
              Goal Progress
            </h2>
            <Link to="/employee/goals" className="text-xs font-semibold text-[#00685e] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {approved.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#e2ecf8] flex items-center justify-center mb-3">
                <Target size={20} className="text-[#00685e]" />
              </div>
              <p className="text-sm font-medium text-[#3d4f5c]">No approved goals yet</p>
              <p className="text-xs text-[#6d7a88] mt-1">Submit your goals for manager approval</p>
            </div>
          ) : (
            <div className="space-y-5">
              {approved.slice(0, 5).map(g => {
                const ci = yearCheckIns.filter(c => (c.goalId?._id || c.goalId) === g._id);
                const latest = ci.sort((a,b) => ['Q4','Q3','Q2','Q1'].indexOf(a.quarter) - ['Q4','Q3','Q2','Q1'].indexOf(b.quarter))[0];
                const pct = latest ? Math.min(100, Math.round((latest.achievement / g.target) * 100)) : 0;
                return (
                  <div key={g._id}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#0d1f2d] truncate">{g.title}</p>
                        <p className="text-xs text-[#6d7a88] mt-0.5">
                          {g.unit} · Target: {g.target} · Weight: {g.weightage}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={g.status} />
                        <span className="text-sm font-bold text-[#00685e] tabular-nums">{pct}%</span>
                      </div>
                    </div>
                    <ProgressBar value={pct} max={100} showPercent={false} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Performance score */}
        <Card className="dashboard-card min-h-[360px]">
          <CardHeader title="Performance Score" subtitle="Weighted cycle completion" />
          <div className="flex flex-col items-center">
            {/* Donut */}
            <div className="relative w-32 h-32 mb-5">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#e2ecf8" strokeWidth="10" />
                <circle cx="60" cy="60" r="48" fill="none" stroke={progressBarColor} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallPct / 100) * 301.6} 301.6`}
                  style={{ transition: 'stroke-dasharray 1s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#0d1f2d]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                  {overallPct}
                </span>
                <span className="text-xs text-[#6d7a88]">%</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              {[
                { label: 'Approved',  val: approved.length,  color: '#10b981' },
                { label: 'Submitted', val: submitted.length, color: '#f59e0b' },
                { label: 'Draft',     val: drafts.length,    color: '#94a3b8' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-[#6d7a88]">{label}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#0d1f2d] tabular-nums">
                    {val} / {yearGoals.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Quarterly Chart */}
      <Card className="dashboard-card p-5 min-h-[246px]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#0d1f2d]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Quarterly Check-in Summary
          </h2>
          <Link to="/employee/checkins" className="text-xs font-semibold text-[#00685e] hover:underline flex items-center gap-1">
            Update check-ins <ArrowRight size={12} />
          </Link>
        </div>
        {hasQuarterData ? (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterData} barSize={22} barGap={5}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef4" vertical={false} />
                <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#6d7a88' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6d7a88' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e8eef4', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,.08)', fontSize: 12 }}
                  cursor={{ fill: '#f0f4f8' }}
                />
                <Bar dataKey="On Track" fill="#85e0d4" radius={[4,4,0,0]} />
                <Bar dataKey="Completed" fill="#00685e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-[#3d4f5c]">No check-ins recorded for {activeYear}</p>
            <p className="text-xs text-[#6d7a88] mt-1">Add your first quarterly update to start analytics.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
