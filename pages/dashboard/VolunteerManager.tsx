import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { addLibraryTask, addNotification, awardVolunteerDocument, deleteLibraryTask, deleteVolunteerTask, getTaskLibrary, getVolunteers, subscribeStoreUpdates, updateTaskProgress, updateVolunteerStatus, upsertVolunteerTask } from '../../services/mockData';
import { COLORS, BRAND } from '../../constants';
import { authService } from '../../services/authService';
import { LibraryTask, UserRole, VolunteerDocument } from '../../types';

const VolunteerManager: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdminOrManager = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user?.role as UserRole);
  const [volunteers, setVolunteers] = useState<any[]>(getVolunteers());
  const [taskLibrary, setTaskLibrary] = useState<LibraryTask[]>(getTaskLibrary());
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<VolunteerDocument | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeStoreUpdates(() => { setVolunteers(getVolunteers()); setTaskLibrary(getTaskLibrary()); }), []);

  const pendingCount = useMemo(() => volunteers.filter(v => v.status === 'Pending').length, [volunteers]);
  const approvedCount = useMemo(() => volunteers.filter(v => v.status === 'Approved').length, [volunteers]);

  const handleQuickApprove = (id: string) => {
    updateVolunteerStatus(id, 'Approved');
    addNotification({ userId: id, title: 'Application approved', message: 'Your volunteer application has been approved.', type: 'general' });
    setVolunteers(getVolunteers());
  };

  const handleQuickReject = (id: string) => {
    updateVolunteerStatus(id, 'Rejected');
    addNotification({ userId: id, title: 'Application reviewed', message: 'Your volunteer application was not approved at this stage.', type: 'general' });
    setVolunteers(getVolunteers());
  };

  if (!isAdminOrManager) {
    return (
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center"><h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>Volunteer Portal</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Join our outreach and service network</p></div>
        <div className="grid gap-6 md:grid-cols-3 text-center">
          <div className="rounded-[2rem] bg-white p-8 border border-slate-100 shadow-sm"><div className="text-4xl font-black">{approvedCount}</div><div className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Active Volunteers</div></div>
          <div className="rounded-[2rem] bg-white p-8 border border-slate-100 shadow-sm"><div className="text-4xl font-black">{pendingCount}</div><div className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Pending Reviews</div></div>
          <div className="rounded-[2rem] bg-white p-8 border border-slate-100 shadow-sm"><div className="text-4xl font-black">{taskLibrary.length}</div><div className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Mission Templates</div></div>
        </div>
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm"><p className="text-slate-600 leading-relaxed">{BRAND.fullName} welcomes community members with practical skills, compassion, and time to give.</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Volunteer Oversight</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Applications, assignments and awards</p>
        </div>
        <div className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400"><div>{approvedCount} approved</div><div>{pendingCount} pending</div></div>
      </div>

      <div className="grid gap-6">
        {volunteers.map(v => (
          <div key={v.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">{v.name}</h3>
                <p className="text-sm text-slate-500">{v.email} {v.phone ? `• ${v.phone}` : ''}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button onClick={() => handleQuickApprove(v.id)} className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Approve</button>
                <button onClick={() => handleQuickReject(v.id)} className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-widest">Reject</button>
              </div>
            </div>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed">{v.message || v.interests || 'Volunteer application record.'}</p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <button onClick={() => updateVolunteerStatus(v.id, 'Approved')} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Mark Approved</button>
              <button onClick={() => updateVolunteerStatus(v.id, 'Rejected')} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">Mark Rejected</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200">
        <h3 className="text-xl font-black mb-4">Task Library</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {taskLibrary.map(task => <div key={task.id} className="rounded-2xl border border-slate-100 p-4"><div className="font-black">{task.title}</div><div className="text-sm text-slate-500">{task.description}</div></div>)}
        </div>
      </div>
    </div>
  );
};

export default VolunteerManager;
