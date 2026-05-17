import { useState, useEffect } from 'react';
import { goalAPI, checkInAPI } from '../../services/api';
import { Card, StatCard, PageHeader, LoadingSpinner, ProgressBar } from '../../components/common';
import { TrendingUp, Target, CheckSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function EmployeeAnalytics() {
  const [goals, setGoals] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [goalsRes, ciRes] = await Promise.all([
          goalAPI.getMyGoals(),
          checkInAPI.getMyCheckIns(),
        ]);
        const allGoals = goalsRes.data.goals || [];
        const allCheckIns = ciRes.data.checkIns || [];
        setGoals(allGoals);
        setCheckIns(allCheckIns);

        const availableYears = [...new Set([
          ...allGoals.map(x => x.year),
          ...allCheckIns.map(x => x.year),
        ].filter(Boolean))].sort((a, b) => b - a);
        setActiveYear(availableYears[0] || new Date().getFullYear());
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  const yearGoals = goals.filter(g => g.year === activeYear);
  const yearCheckIns = checkIns.filter(c => c.year === activeYear);
  const approved = yearGoals.filter(g => g.status === 'approved' || g.status === 'locked');
  const quarterData = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
    const qci = yearCheckIns.filter(c => c.quarter === q);
    const totalPct = qci.reduce((s, c) => {
      const g = approved.find(g => g._id === (c.goalId?._id || c.goalId));
      return s + (g ? Math.min(100, (c.achievement / g.target) * 100) : 0);
    }, 0);
    return { quarter: q, avgProgress: qci.length > 0 ? Math.round(totalPct / qci.length) : 0, checkIns: qci.length };
  });

  const goalPerformance = approved.map(g => {
    const gci = yearCheckIns.filter(c => (c.goalId?._id || c.goalId) === g._id);
    const latest = gci.sort((a, b) => ['Q4','Q3','Q2','Q1'].indexOf(a.quarter) - ['Q4','Q3','Q2','Q1'].indexOf(b.quarter))[0];
    return { title: g.title.length > 22 ? g.title.substring(0, 22) + '...' : g.title, progress: latest ? Math.min(100, Math.round((latest.achievement / g.target) * 100)) : 0, weightage: g.weightage };
  });

  return (
    <div className="fade-in content-stack">
      <PageHeader title="My Analytics" subtitle={`Track your performance trends and progress · ${activeYear}`} />

      <div className="kpi-grid">
        <StatCard title="Approved Goals" value={approved.length} icon={Target} color="var(--color-teal-600, #0d9488)" bg="#e5eeff" />
        <StatCard title="Check-ins Done" value={yearCheckIns.length} icon={CheckSquare} color="var(--color-teal-700, #0f766e)" bg="#dcfce7" />
        <StatCard title="Completed" value={yearCheckIns.filter(c => c.status === 'completed').length} icon={TrendingUp} color="#1d4ed8" bg="#dbeafe" />
        <StatCard title="Avg Progress" value={`${goalPerformance.length > 0 ? Math.round(goalPerformance.reduce((s, g) => s + g.progress, 0) / goalPerformance.length) : 0}%`} icon={TrendingUp} color="#934529" bg="#ffdbd0" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="dashboard-card p-6 min-h-[250px]">
          <h2 className="text-lg font-semibold text-slate-900 mb-4" className="font-display">Quarterly Progress Trend</h2>
          <ResponsiveContainer width="100%" height={176}>
            <LineChart data={quarterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-slate-600, #475569)' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5eeff' }} formatter={v => [`${v}%`, 'Avg Progress']} />
              <Line type="monotone" dataKey="avgProgress" stroke="var(--color-teal-600, #0d9488)" strokeWidth={2.5} dot={{ fill: 'var(--color-teal-600, #0d9488)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="dashboard-card p-6 min-h-[250px]">
          <h2 className="text-lg font-semibold text-slate-900 mb-4" className="font-display">Goal-wise Progress</h2>
          {goalPerformance.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No approved goals yet</p>
          ) : (
            <div className="space-y-6">
              {goalPerformance.map((g, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium truncate pr-4">{g.title}</span>
                    <span className="font-bold text-teal-600 flex-shrink-0">{g.progress}%</span>
                  </div>
                  <ProgressBar value={g.progress} max={100} showPercent={false} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}



