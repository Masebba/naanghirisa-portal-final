
import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, updateUser, addUser, deleteUser, resetUserPassword } from '../../services/mockData';
import { User, UserRole } from '../../types';
import { COLORS } from '../../constants';

type FilterType = 'All' | 'Admins' | 'Donors' | 'Volunteers';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUsers([...getUsers()]);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesRole = true;
      if (filter === 'Admins') {
        matchesRole = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(u.role);
      } else if (filter === 'Donors') {
        matchesRole = u.role === UserRole.DONOR;
      } else if (filter === 'Volunteers') {
        matchesRole = u.role === UserRole.VOLUNTEER;
      }

      return matchesSearch && matchesRole;
    });
  }, [users, filter, searchTerm]);

  const handleSave = () => {
    if (editingUser) {
      if (editingUser.id) {
        // Edit existing
        const updated = editingUser as User;
        updateUser(updated);
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        alert(`Member profile for ${updated.name} updated.`);
      } else {
        // Create new
        const newUser: User = {
          ...editingUser,
          id: `u${Date.now()}`,
          password: 'user123', // Default temporary password
          avatar: editingUser.avatar || `https://i.pravatar.cc/150?u=${editingUser.email || Date.now()}`,
          phone: editingUser.phone || '',
        } as User;

        addUser(newUser);
        setUsers([...users, newUser]);
        alert(`User Account Provisioned! \n\nName: ${newUser.name}\nIdentifier: ${newUser.email || newUser.phone}\nTemp Password: user123\n\n[System]: Member can now log in using these credentials.`);
      }
      setEditingUser(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently revoke this user access? All portal data for this member will be inaccessible.')) {
      deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleResetPassword = (u: User) => {
    const newPass = prompt(`Set new password for ${u.name}:`, 'user123');
    if (newPass) {
      resetUserPassword(u.id, newPass);
      alert(`Password for ${u.name} has been reset.`);
    }
  };

  const roles = [
    { label: 'Super Admin', value: UserRole.SUPER_ADMIN },
    { label: 'Manager Admin', value: UserRole.MID_ADMIN },
    { label: 'Staff Admin', value: UserRole.STAFF_ADMIN },
    { label: 'Donor', value: UserRole.DONOR },
    { label: 'Volunteer', value: UserRole.VOLUNTEER },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Personnel & Access Control</h2>
          <p className="text-slate-400 text-xs font-bold tracking-widest mt-1">Provision administrative tiers and manage organizational members</p>
        </div>
        <button
          onClick={() => setEditingUser({ name: '', email: '', phone: '', role: UserRole.STAFF_ADMIN })}
          className="px-6 py-3 bg-slate-900 text-white font-black rounded-lg hover:bg-black transition-all text-[10px] tracking-widest shadow-xl"
        >
          Add New User
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          {(['All', 'Admins', 'Donors', 'Volunteers'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {editingUser && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xl space-y-4 animate-in zoom-in-95">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tighter">
              {editingUser.id ? 'Modify Access Permissions' : 'Provision New Account'}
            </h3>
            {!editingUser.id && <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase rounded-lg border border-orange-100">Temp Pass: user123</span>}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
              <input className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 outline-none focus:ring-1 focus:ring-slate-500" value={editingUser.name || ''} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} placeholder="e.g. Sarah Namono" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
              <input className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 outline-none focus:ring-1 focus:ring-slate-500" value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} placeholder="email@naanghirisa.org" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
              <input className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 outline-none focus:ring-1 focus:ring-slate-500" value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} placeholder="07... / +256..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Permission Tier</label>
              <select className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 outline-none focus:ring-1 focus:ring-slate-500" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}>
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={handleSave} className="px-5 py-2 bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-orange-700 shadow-lg shadow-orange-100 transition-all">
              {editingUser.id ? 'Save Updates' : 'Confirm & Provision Account'}
            </button>
            <button onClick={() => setEditingUser(null)} className="px-5 py-2 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-200">Discard</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {filteredUsers.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Member Profile</th>
                <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Contact Channels</th>
                <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">System Tier</th>
                <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-200/50 transition-colors">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-2xl bg-red-900 text-white flex items-center justify-center font-black text-xs overflow-hidden">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm tracking-tight">{u.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-1">
                    <div className="space-y-1">
                      {u.email && <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><i className="fas fa-envelope text-[8px]"></i> {u.email}</div>}
                      {u.phone && <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><i className="fas fa-phone text-[8px]"></i> {u.phone}</div>}
                    </div>
                  </td>
                  <td className="px-10 py-1">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${[UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(u.role)
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : u.role === UserRole.DONOR
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                      {roles.find(r => r.value === u.role)?.label || u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-1 text-right space-x-3">
                    <button onClick={() => handleResetPassword(u)} title="Reset Password" className="text-slate-300 hover:text-orange-600 transition-colors"><i className="fas fa-key"></i></button>
                    <button onClick={() => setEditingUser(u)} title="Edit Details" className="text-slate-300 hover:text-blue-600 transition-colors"><i className="fas fa-user-edit"></i></button>
                    <button onClick={() => handleDelete(u.id)} title="Revoke Access" className="text-slate-300 hover:text-red-600 transition-colors"><i className="fas fa-user-minus"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <i className="fas fa-users-slash text-5xl mb-4"></i>
            <p className="font-black text-xs uppercase tracking-widest">No members found matching these criteria</p>
            <button onClick={() => { setFilter('All'); setSearchTerm(''); }} className="mt-4 text-orange-600 font-bold text-[10px] uppercase hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
