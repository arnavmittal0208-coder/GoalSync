import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { authAPI } from '../../services/api';
import { Card, Avatar, StatusBadge, Button, Modal, Input, Select, EmptyState, LoadingSpinner, PageHeader } from '../../components/common';
import { Users, Plus, Edit2, UserX, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  admin:    'bg-violet-50 text-violet-700',
  manager:  'bg-blue-50 text-blue-700',
  employee: 'bg-emerald-50 text-emerald-700',
};

const BLANK = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '' };

export default function UserManagement() {
  const [users,    setUsers]    = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [roleF,    setRoleF]    = useState('');
  const [editUser, setEditUser] = useState(null);
  const [addOpen,  setAddOpen]  = useState(false);
  const [form,     setForm]     = useState(BLANK);
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    try {
      const [u, m] = await Promise.all([userAPI.getUsers(), userAPI.getManagers()]);
      setUsers(u.data.users || []);
      setManagers(m.data.managers || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    return (
      (!search || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) &&
      (!roleF || u.role === roleF)
    );
  });

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department || '', designation: u.designation || '', phone: u.phone || '', managerId: u.managerId?._id || '', password: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editUser) {
        await userAPI.updateUser(editUser._id, form);
        toast.success('User updated');
        setEditUser(null);
      } else {
        await authAPI.register(form);
        toast.success('User created');
        setAddOpen(false);
        setForm(BLANK);
      }
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await userAPI.deleteUser(id);
      toast.success('User deactivated');
      load();
    } catch { toast.error('Failed'); }
  };

  const UserForm = ({ isEdit = false }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Input label="Full Name *"  value={form.name}  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}  placeholder="Jane Smith" />
        <Input label="Work Email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" />
      </div>
      {!isEdit && (
        <Input label="Password *" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 characters" />
      )}
      <div className="grid grid-cols-2 gap-6">
        <Select label="Role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
          options={[{ value:'employee', label:'Employee' }, { value:'manager', label:'Manager' }, { value:'admin', label:'Admin / HR' }]} />
        <Input label="Department" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Engineering" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input label="Designation" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="Senior Engineer" />
        <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555-0000" />
      </div>
      {form.role === 'employee' && managers.length > 0 && (
        <Select label="Reporting Manager" value={form.managerId || ''}
          onChange={e => setForm(p => ({ ...p, managerId: e.target.value }))}
          options={[{ value: '', label: '— Select manager —' }, ...managers.map(m => ({ value: m._id, label: `${m.name} (${m.department || 'N/A'})` }))]} />
      )}
    </div>
  );

  if (loading) return <LoadingSpinner text="Loading users…" />;

  return (
    <div className="fade-in content-stack">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} users registered`}
        actions={<Button onClick={() => { setAddOpen(true); setForm(BLANK); }} variant="primary">
          <Plus size={15} /> Add User
        </Button>}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:gap-4 md:items-center md:justify-between">
        <div className="relative flex-1">
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name or email…"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" 
          />
        </div>
        <div className="relative w-full md:w-48">
          <select 
            value={roleF} 
            onChange={e => setRoleF(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 appearance-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" subtitle="Try adjusting your search or filter." />
      ) : (
        <Card>
          <div className="table-scroll">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[var(--color-slate-200, #e2e8f0)]">
                  {['User', 'Role', 'Department', 'Manager', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f8]">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-6">
                        <Avatar name={u.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                          <p className="text-xs text-slate-600 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${ROLE_COLORS[u.role] || 'bg-gray-50 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{u.department || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{u.managerId?.name || '—'}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(u)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-[#e2ecf8] transition-colors">
                          <Edit2 size={13} />
                        </button>
                        {u.isActive && (
                          <button onClick={() => handleDeactivate(u._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#ba1a1a] hover:bg-[#fef2f2] transition-colors">
                            <UserX size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-[var(--color-slate-200, #e2e8f0)] text-xs text-slate-600">
            Showing {filtered.length} of {users.length} users
          </div>
        </Card>
      )}

      {/* Modals */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" subtitle="Update user details and permissions" size="lg"
        footer={<><Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button><Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button></>}>
        <UserForm isEdit />
      </Modal>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User"
        subtitle="Create an account for a team member" size="lg"
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} loading={saving}>Create User</Button></>}>
        <UserForm />
      </Modal>
    </div>
  );
}



