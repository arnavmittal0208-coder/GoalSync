import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import { Card, PageHeader, Button, LoadingSpinner } from '../../components/common';
import { FileText, Download, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('report');
  const [year, setYear] = useState(new Date().getFullYear());
  const [downloading, setDownloading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportRes, auditRes, cyclesRes] = await Promise.all([
        reportAPI.getReportData({ year }),
        reportAPI.getAuditLogs({ limit: 50 }),
        reportAPI.getCycles(),
      ]);
      setReportData(reportRes.data.data || []);
      setAuditLogs(auditRes.data.logs || []);
      setCycles(cyclesRes.data.cycles || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [year]);

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      const response = await reportAPI.downloadReport({ year, format });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GoalSync_Report_${year}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch { toast.error('Download failed'); }
    finally { setDownloading(false); }
  };

  const [newCycle, setNewCycle] = useState({ name: '', year: new Date().getFullYear(), quarter: 'Annual', startDate: '', endDate: '', description: '' });
  const handleCreateCycle = async () => {
    try {
      await reportAPI.createCycle(newCycle);
      toast.success('Cycle created!');
      fetchData();
    } catch { toast.error('Failed to create cycle'); }
  };

  const handleActivateCycle = async (id) => {
    try {
      await reportAPI.updateCycle(id, { isActive: true });
      toast.success('Cycle activated!');
      fetchData();
    } catch { toast.error('Failed to activate cycle'); }
  };

  return (
    <div className="fade-in content-stack">
      <PageHeader title="Reports & Management" subtitle="Export reports, view audit logs, and manage goal cycles" />

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { val: 'report', label: 'Performance Report', icon: FileText },
          { val: 'audit', label: 'Audit Logs', icon: Shield },
          { val: 'cycles', label: 'Goal Cycles', icon: Calendar },
        ].map(({ val, label, icon: Icon }) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === val ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-[#e5eeff] hover:border-[var(--color-teal-600, #0d9488)]'
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Performance Report */}
      {tab === 'report' && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-slate-700">Year:</label>
                <select value={year} onChange={e => setYear(+e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#bcc9c6] text-sm outline-none focus:border-[var(--color-teal-600, #0d9488)]">
                  {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleDownload('csv')} loading={downloading}>
                  <Download size={14} /> Export CSV
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleDownload('excel')} loading={downloading}>
                  <Download size={14} /> Export Excel
                </Button>
              </div>
            </div>
          </Card>

          {loading ? <LoadingSpinner /> : (
            <Card>
              <div className="table-scroll">
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr className="border-b border-[#e5eeff]">
                      {['Employee', 'Department', 'Total Goals', 'Approved', 'Completed', 'Performance'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, i) => (
                      <tr key={i} className="border-b border-[#f8f9ff] hover:bg-[#f8f9ff] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">{row.employee}</p>
                          <p className="text-xs text-slate-600">{row.designation}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{row.department || '—'}</td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-700">{row.totalGoals}</td>
                        <td className="px-4 py-3 text-sm font-mono text-[var(--color-teal-700, #0f766e)]">{row.approvedGoals}</td>
                        <td className="px-4 py-3 text-sm font-mono text-[#1d4ed8]">{row.completedGoals}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${row.performance}%`, background: row.performance >= 70 ? 'var(--color-teal-700, #0f766e)' : row.performance >= 40 ? '#d97706' : '#ba1a1a' }} />
                            </div>
                            <span className={`text-sm font-bold ${row.performance >= 70 ? 'text-[var(--color-teal-700, #0f766e)]' : row.performance >= 40 ? 'text-[#d97706]' : 'text-[#ba1a1a]'}`}>{row.performance}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.length === 0 && (
                  <p className="text-center text-sm text-slate-600 py-8">No report data for {year}</p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Audit Logs */}
      {tab === 'audit' && (
        <Card>
          <div className="table-scroll">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-[#e5eeff]">
                  {['Action', 'Entity', 'Performed By', 'Timestamp', 'Details'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log._id} className="border-b border-[#f8f9ff] hover:bg-[#f8f9ff] transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        log.action === 'APPROVE' ? 'bg-[#dcfce7] text-[#166534]' :
                        log.action === 'REJECT' ? 'bg-[#fee2e2] text-[#991b1b]' :
                        log.action === 'CREATE' ? 'bg-[#dbeafe] text-[#1e40af]' :
                        log.action === 'DELETE' ? 'bg-[#fef3c7] text-[#92400e]' :
                        'bg-[#f3f4f6] text-[#6b7280]'
                      }`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#3d4947]">{log.entity}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{log.userId?.name || '—'}</p>
                      <p className="text-xs text-slate-600">{log.userId?.role}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                      {log.newValue?.title || log.newValue?.event || JSON.stringify(log.newValue)?.substring(0, 40) || '—'}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-sm text-slate-600 py-8">No audit logs yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Goal Cycles */}
      {tab === 'cycles' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Create New Cycle</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
              <input value={newCycle.name} onChange={e => setNewCycle(p => ({ ...p, name: e.target.value }))} placeholder="Cycle name (e.g., Q3 2025)" className="px-4 py-2.5 rounded-xl border border-[#bcc9c6] text-sm outline-none focus:border-[var(--color-teal-600, #0d9488)]" />
              <input type="number" value={newCycle.year} onChange={e => setNewCycle(p => ({ ...p, year: +e.target.value }))} placeholder="Year" className="px-4 py-2.5 rounded-xl border border-[#bcc9c6] text-sm outline-none focus:border-[var(--color-teal-600, #0d9488)]" />
              <select value={newCycle.quarter} onChange={e => setNewCycle(p => ({ ...p, quarter: e.target.value }))} className="px-4 py-2.5 rounded-xl border border-[#bcc9c6] text-sm outline-none focus:border-[var(--color-teal-600, #0d9488)]">
                {['Q1', 'Q2', 'Q3', 'Q4', 'Annual'].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <input type="date" value={newCycle.startDate} onChange={e => setNewCycle(p => ({ ...p, startDate: e.target.value }))} className="px-4 py-2.5 rounded-xl border border-[#bcc9c6] text-sm outline-none focus:border-[var(--color-teal-600, #0d9488)]" />
              <input type="date" value={newCycle.endDate} onChange={e => setNewCycle(p => ({ ...p, endDate: e.target.value }))} className="px-4 py-2.5 rounded-xl border border-[#bcc9c6] text-sm outline-none focus:border-[var(--color-teal-600, #0d9488)]" />
            </div>
            <textarea
              value={newCycle.description}
              onChange={e => setNewCycle(p => ({ ...p, description: e.target.value }))}
              placeholder="Optional description"
              className="w-full mb-4 px-4 py-2.5 rounded-xl border border-[#bcc9c6] text-sm outline-none focus:border-[var(--color-teal-600, #0d9488)] resize-none"
              rows={3}
            />
            <Button onClick={handleCreateCycle}><Calendar size={15} /> Create Cycle</Button>
          </Card>

          <div className="space-y-3">
            {cycles.map(cycle => (
              <Card key={cycle._id} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{cycle.name}</h3>
                      {cycle.isActive && <span className="px-2 py-0.5 text-xs rounded-full bg-[#dcfce7] text-[#166534] font-semibold border border-[#bbf7d0]">● Active</span>}
                    </div>
                    <p className="text-sm text-slate-600">{cycle.quarter} {cycle.year} · {new Date(cycle.startDate).toLocaleDateString()} – {new Date(cycle.endDate).toLocaleDateString()}</p>
                    {cycle.description && <p className="text-xs text-slate-600 mt-1">{cycle.description}</p>}
                  </div>
                  {!cycle.isActive && (
                    <Button size="sm" variant="secondary" onClick={() => handleActivateCycle(cycle._id)}>Set Active</Button>
                  )}
                </div>
              </Card>
            ))}
            {cycles.length === 0 && <p className="text-sm text-slate-600 text-center py-8">No goal cycles created yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}



