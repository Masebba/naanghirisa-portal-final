import React, { useEffect, useMemo, useState } from 'react';
import { getUsers } from '../../services/mockData';
import { userAdminService } from '../../services/userAdminService';
import { COLORS } from '../../constants';
import { User, UserRole } from '../../types';

type FilterType = 'All' | 'Admins' | 'Donors' | 'Volunteers';

type EditingUser = Partial<User> & { password?: string; confirmPassword?: string };

const roles = [
  { label: 'Super Admin', value: UserRole.SUPER_ADMIN },
  { label: 'Manager Admin', value: UserRole.MID_ADMIN },
  { label: 'Staff Admin', value: UserRole.STAFF_ADMIN },
  { label: 'Donor', value: UserRole.DONOR },
  { label: 'Volunteer', value: UserRole.VOLUNTEER },
];

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setUsers([...getUsers()]);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        filter === 'All'
          ? true
          : filter === 'Admins'
            ? [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user.role)
            : filter === 'Donors'
              ? user.role === UserRole.DONOR
              : user.role === UserRole.VOLUNTEER;
      return matchesSearch && matchesRole;
    });
  }, [users, filter, searchTerm]);

  const handleSave = async () => {
    if (!editingUser?.name || !editingUser.email || !editingUser.role) {
      window.alert('Please complete the name, email, and role fields.');
      return;
    }

    if (editingUser.id) {
      if (editingUser.password) {
        window.alert('Password changes use the reset-password flow on Spark plan.');
        return;
      }
      const updated: User = {
        ...editingUser,
        id: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone || '',
        role: editingUser.role,
        avatar: editingUser.avatar,
      } as User;
      await userAdminService.updateUser(updated);
      setUsers([...getUsers()]);
      window.alert(`Member profile for ${updated.name} updated.`);
    } else {
      if (!editingUser.password || editingUser.password.length < 8) {
        window.alert('Please set a password with at least 8 characters.');
        return;
      }
      const newUser: User = {
        id: `u_${Date.now()}`,
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone || '',
        role: editingUser.role,
        password: editingUser.password,
        avatar: editingUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(editingUser.email || editingUser.name || Date.now().toString())}`,
      } as User;
      const created = await userAdminService.createUser(newUser as User & { password: string });
      setUsers([...getUsers()]);
      window.alert(`User account created for ${(created as any).name || newUser.name}.`);
    }

    setEditingUser(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Disable this user access? Their account will be marked inactive.')) {
      await userAdminService.deleteUser(id);
      setUsers([...getUsers()]);
    }
  };

  const handlePasswordReset = async () => {
    if (!passwordResetUser) return;
    await userAdminService.resetPassword(passwordResetUser.id);
    setUsers([...getUsers()]);
    window.alert(`A password reset email was sent to ${passwordResetUser.name}.`);
    setPasswordResetUser(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Personnel & access control</h2>
          <p className="mt-1 text-xs font-bold tracking-widest text-slate-400">Manage organisational members and portal roles</p>
        </div>
        <button
          onClick={() => { setShowPassword(false); setEditingUser({ name: '', email: '', phone: '', role: UserRole.STAFF_ADMIN, password: '' }); }}
          className="rounded-lg bg-slate-900 px-6 py-3 text-[10px] font-black tracking-widest text-white transition hover:bg-black"
        >
          Add new user
        </button>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:flex-row">
        <div className="flex w-full rounded-lg bg-slate-100 p-1 md:w-auto">
          {(['All', 'Admins', 'Donors', 'Volunteers'] as FilterType[]).map(filterItem => (
            <button
              key={filterItem}
              onClick={() => setFilter(filterItem)}
              className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition ${filter === filterItem ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {filterItem}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="Search by name or email"
            className="w-full rounded-lg border border-slate-100 bg-slate-50 py-3 pl-12 pr-6 text-xs outline-none focus:ring-1 focus:ring-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {editingUser && (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xl animate-in zoom-in-95">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-black uppercase tracking-tighter">{editingUser.id ? 'Modify access permissions' : 'Provision new account'}</h3>
          </div>

          <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">Full name</label>
              <input className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 outline-none focus:ring-1 focus:ring-slate-500" value={editingUser.name || ''} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} placeholder="Enter full name" />
            </div>
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">Email address</label>
              <input className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-60" value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} placeholder="name@organisation.org" disabled={Boolean(editingUser.id)} />
            </div>
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">Phone number</label>
              <input className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 outline-none focus:ring-1 focus:ring-slate-500" value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} placeholder="07... / +256..." />
            </div>
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">Permission tier</label>
              <select className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 outline-none focus:ring-1 focus:ring-slate-500" value={editingUser.role || UserRole.STAFF_ADMIN} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}>
                {roles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 pr-11 outline-none focus:ring-1 focus:ring-slate-500"
                  value={editingUser.password || ''}
                  onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder={editingUser.id ? 'Password managed through reset email' : 'Minimum 8 characters'}
                  disabled={Boolean(editingUser.id)}
                />
                <button type="button" onClick={() => setShowPassword(show => !show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm px-2 py-1 text-slate-400 transition hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>
            <div className="flex items-end justify-start gap-2 pt-5">
              <button onClick={handleSave} className="rounded-lg bg-orange-600 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-100 transition hover:bg-orange-700">
                {editingUser.id ? 'Save updates' : 'Create account'}
              </button>
              <button onClick={() => setEditingUser(null)} className="rounded-lg bg-slate-100 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-200">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordResetUser && (
        <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-xl">
          <h3 className="text-lg font-black uppercase tracking-tight">Send reset email to {passwordResetUser.name}</h3>
          <p className="mt-3 text-sm text-slate-500">A secure password reset link will be sent to the account email on file.</p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <button onClick={handlePasswordReset} className="rounded-lg bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-black">
              Send reset email
            </button>
            <button onClick={() => setPasswordResetUser(null)} className="rounded-lg bg-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="min-h-[400px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {filteredUsers.length > 0 ? (
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Member profile</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact channels</th>
                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System tier</th>
                <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="transition hover:bg-slate-50/70">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-xs font-black text-white">
                        {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" alt={user.name} /> : user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight text-slate-900">{user.name}</p>
                        <p className="text-[10px] font-bold tracking-widest text-slate-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-4">
                    <div className="space-y-1">
                      {user.email && <div className="text-[10px] font-bold text-slate-500"><i className="fas fa-envelope mr-2 text-[8px]" />{user.email}</div>}
                      {user.phone && <div className="text-[10px] font-bold text-slate-500"><i className="fas fa-phone mr-2 text-[8px]" />{user.phone}</div>}
                    </div>
                  </td>
                  <td className="px-10 py-4">
                    <span className={`rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user.role)
                      ? 'border-orange-100 bg-orange-50 text-orange-600'
                      : user.role === UserRole.DONOR
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                        : 'border-blue-100 bg-blue-50 text-blue-600'}`}
                    >
                      {roles.find(role => role.value === user.role)?.label || user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-4 text-right space-x-3">
                    <button onClick={() => setPasswordResetUser(user)} title="Reset password" className="text-slate-300 transition hover:text-orange-600"><i className="fas fa-key" /></button>
                    <button onClick={() => setEditingUser({ ...user })} title="Edit details" className="text-slate-300 transition hover:text-blue-600"><i className="fas fa-user-edit" /></button>
                    <button onClick={() => handleDelete(user.id)} title="Revoke access" className="text-slate-300 transition hover:text-red-600"><i className="fas fa-user-minus" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <i className="fas fa-users-slash mb-4 text-5xl" />
            <p className="text-xs font-black uppercase tracking-widest">No members found</p>
            <button onClick={() => { setFilter('All'); setSearchTerm(''); }} className="mt-4 text-[10px] font-bold uppercase text-orange-600 hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
