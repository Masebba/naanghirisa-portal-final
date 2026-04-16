import React, { useEffect, useMemo, useState } from 'react';
import { COLORS, BRAND } from '../../constants';
import { authService } from '../../services/authService';
import { notify } from '../../services/notifications';
import {
  acceptVolunteerApplication,
  addLibraryTask,
  addNotification,
  awardVolunteerDocument,
  deleteLibraryTask,
  deleteVolunteerTask,
  getTaskLibrary,
  getVolunteers,
  subscribeStoreUpdates,
  updateTaskProgress,
  updateVolunteerStatus,
  upsertVolunteerTask,
} from '../../services/mockData';
import { LibraryTask, UserRole, VolunteerDocument, type VolunteerTask } from '../../types';

const perPage = 6;

type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Active' | 'Rejected' | 'Disabled';

const VolunteerManager: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdminOrManager = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user?.role as UserRole);
  const [volunteers, setVolunteers] = useState<any[]>(getVolunteers());
  const [taskLibrary, setTaskLibrary] = useState<LibraryTask[]>(getTaskLibrary());
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', durationDays: 7 });
  const [docForm, setDocForm] = useState({ type: 'certificate' as VolunteerDocument['type'], title: '', reason: '' });
  const [libraryForm, setLibraryForm] = useState({ title: '', description: '', durationDays: 7 });
  const [performanceNote, setPerformanceNote] = useState('');
  const [performanceScore, setPerformanceScore] = useState(5);
  const [reportText, setReportText] = useState('');

  useEffect(() => subscribeStoreUpdates(() => { setVolunteers(getVolunteers()); setTaskLibrary(getTaskLibrary()); }), []);

  const applicationPool = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return volunteers.filter(v => {
      const text = `${v.name || ''} ${v.email || ''} ${v.phone || ''} ${v.message || ''} ${v.interests || ''} ${v.status || ''}`.toLowerCase();
      const matchesSearch = !term || text.includes(term);
      const matchesStatus = statusFilter === 'All' || (v.status || 'Pending') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(applicationPool.length / perPage));
  const visibleApplications = applicationPool.slice((page - 1) * perPage, page * perPage);
  const selectedVolunteer = useMemo(() => volunteers.find(v => v.id === selectedVolunteerId) || null, [volunteers, selectedVolunteerId]);
  const pendingApplications = volunteers.filter(v => v.status === 'Pending');
  const activeVolunteers = volunteers.filter(v => ['Approved', 'Active'].includes(v.status));
  const rejectedVolunteers = volunteers.filter(v => v.status === 'Rejected' || v.status === 'Disabled');
  const taskCount = volunteers.reduce((sum, volunteer) => sum + (volunteer.tasks?.length || 0), 0);
  const documentCount = volunteers.reduce((sum, volunteer) => sum + (volunteer.documents?.length || 0), 0);
  const avgTaskProgress = taskCount
    ? Math.round(volunteers.reduce((sum, volunteer) => sum + (volunteer.tasks || []).reduce((acc: number, task: VolunteerTask) => acc + task.progress, 0), 0) / taskCount)
    : 0;

  useEffect(() => setPage(1), [searchTerm, statusFilter]);

  useEffect(() => {
    if (selectedVolunteer) {
      setPerformanceNote(selectedVolunteer.performanceNotes || selectedVolunteer.note || '');
      setPerformanceScore(Number(selectedVolunteer.performanceScore || 5));
    } else {
      setPerformanceNote('');
      setPerformanceScore(5);
    }
  }, [selectedVolunteerId]);

  const refresh = () => {
    setVolunteers(getVolunteers());
    setTaskLibrary(getTaskLibrary());
  };

  const handleApprove = async (application: any) => {
    try {
      setBusyId(application.id);
      await acceptVolunteerApplication(application.id);
      refresh();
      setSelectedVolunteerId(application.id);
      setStatusFilter('Active');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to approve this application.');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateVolunteerStatus(id, status, { reviewDate: new Date().toISOString(), reviewedBy: user?.name || 'Administration' });
    refresh();
  };

  const handleReject = (id: string) => {
    updateVolunteerStatus(id, 'Rejected', { rejectionNote: 'Not approved at this stage.', reviewDate: new Date().toISOString() });
    refresh();
  };

  const assignTask = () => {
    if (!selectedVolunteer) return;
    if (!taskForm.title.trim()) {
      notify('Enter a task title first.');
      return;
    }
    const task: VolunteerTask = {
      id: `task_${Date.now()}`,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      progress: 0,
      status: 'In Progress',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + taskForm.durationDays * 86400000).toISOString().split('T')[0],
      assignedTo: selectedVolunteer.id,
    };
    upsertVolunteerTask(selectedVolunteer.id, task);
    addNotification({ userId: selectedVolunteer.id, title: 'New task assigned', message: task.title, type: 'mission' });
    setTaskForm({ title: '', description: '', durationDays: 7 });
    refresh();
  };

  const savePerformance = () => {
    if (!selectedVolunteer) return;
    updateVolunteerStatus(selectedVolunteer.id, selectedVolunteer.status || 'Active', {
      performanceNotes: performanceNote.trim(),
      performanceScore,
      lastReviewedAt: new Date().toISOString(),
      reviewedBy: user?.name || 'Administration',
    } as any);
    addNotification({ userId: selectedVolunteer.id, title: 'Performance updated', message: `Your latest review score is ${performanceScore}/10.`, type: 'status' });
    refresh();
  };

  const issueDocument = () => {
    if (!selectedVolunteer) return;
    if (!docForm.title.trim() || !docForm.reason.trim()) {
      notify('Complete the document title and reason.');
      return;
    }
    awardVolunteerDocument(selectedVolunteer.id, {
      type: docForm.type,
      title: docForm.title.trim(),
      reason: docForm.reason.trim(),
      issuedBy: user?.name || 'Administration',
    });
    addNotification({ userId: selectedVolunteer.id, title: docForm.type === 'certificate' ? 'Certificate issued' : 'Recommendation letter issued', message: docForm.title.trim(), type: 'recognition' });
    setDocForm({ type: 'certificate', title: '', reason: '' });
    refresh();
  };

  const saveLibraryTask = () => {
    if (!libraryForm.title.trim()) return;
    addLibraryTask({ id: '', title: libraryForm.title.trim(), description: libraryForm.description.trim(), durationDays: libraryForm.durationDays });
    setLibraryForm({ title: '', description: '', durationDays: 7 });
    setTaskLibrary(getTaskLibrary());
  };

  const downloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      totalApplications: volunteers.length,
      pendingApplications: pendingApplications.length,
      activeVolunteers: activeVolunteers.length,
      rejectedVolunteers: rejectedVolunteers.length,
      taskCount,
      documentCount,
      averageProgress: avgTaskProgress,
      volunteers: volunteers.map(v => ({
        name: v.name,
        email: v.email,
        status: v.status,
        tasks: (v.tasks || []).length,
        documents: (v.documents || []).length,
        score: v.performanceScore || 0,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteer-report.json';
    a.click();
    URL.revokeObjectURL(url);
    setReportText('Volunteer report downloaded.');
  };

  if (!isAdminOrManager) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>Volunteer Portal</h2>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Join our outreach and service network</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 text-center">
          <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm"><div className="text-3xl font-black">{activeVolunteers.length}</div><div className="mt-2 text-xs font-black uppercase tracking-widest text-slate-400">Active Volunteers</div></div>
          <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm"><div className="text-3xl font-black">{pendingApplications.length}</div><div className="mt-2 text-xs font-black uppercase tracking-widest text-slate-400">Pending Reviews</div></div>
          <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm"><div className="text-3xl font-black">{taskLibrary.length}</div><div className="mt-2 text-xs font-black uppercase tracking-widest text-slate-400">Mission Templates</div></div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm"><p className="leading-relaxed text-slate-600">{BRAND.fullName} welcomes community members with practical skills, compassion, and time to give.</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Volunteer Hub</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Manage applications, active volunteers, tasks, reports and recognition</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <button type="button" onClick={downloadReport} className="rounded-lg bg-slate-900 px-4 py-2 text-white">Download report</button>
          <button type="button" onClick={() => refresh()} className="rounded-lg bg-slate-100 px-4 py-2 text-slate-600">Refresh</button>
        </div>
      </div>

      {reportText && <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{reportText}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Applications" value={pendingApplications.length.toString()} tone="orange" />
        <StatCard label="Active volunteers" value={activeVolunteers.length.toString()} tone="emerald" />
        <StatCard label="Tasks assigned" value={taskCount.toString()} tone="blue" />
        <StatCard label="Documents issued" value={documentCount.toString()} tone="slate" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input type="text" placeholder="Search volunteers" className="w-full rounded-lg border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Pending', 'Approved', 'Active', 'Rejected', 'Disabled'] as StatusFilter[]).map(status => (
                <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}`}>
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {visibleApplications.length > 0 ? visibleApplications.map(application => (
              <div key={application.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{application.name}</h3>
                      <span className="rounded-full bg-orange-50 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-orange-600">{application.status}</span>
                      {application.accountId && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-600">Account created</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{application.email}{application.phone ? ` • ${application.phone}` : ''}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{application.message || application.interests || 'Volunteer application record.'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busyId === application.id} onClick={() => handleApprove(application)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 disabled:opacity-50">Approve</button>
                    <button type="button" onClick={() => handleStatusChange(application.id, 'Active')} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-700">Activate</button>
                    <button type="button" onClick={() => handleStatusChange(application.id, 'Disabled')} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600">Hold</button>
                    <button type="button" onClick={() => handleReject(application.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700">Reject</button>
                    <button type="button" onClick={() => setSelectedVolunteerId(application.id)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600">Manage</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 shadow-sm">
                <i className="fas fa-user-friends mb-3 text-3xl" />
                <p className="text-xs font-black uppercase tracking-widest">No volunteer records match this filter</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-40">Previous</button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const n = index + 1;
                  return <button key={n} type="button" onClick={() => setPage(n)} className={`h-9 min-w-9 rounded-full px-3 text-[10px] font-black uppercase tracking-widest ${page === n ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{n}</button>;
                })}
              </div>
              <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>

        {selectedVolunteer && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedVolunteer.name}</h3>
                  <p className="text-sm text-slate-500">{selectedVolunteer.email}</p>
                </div>
                <span className="rounded-full bg-slate-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">{selectedVolunteer.status}</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Task title</label>
                  <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Duration (days)</label>
                  <input type="number" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" value={taskForm.durationDays} onChange={e => setTaskForm({ ...taskForm, durationDays: Number(e.target.value) })} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Task description</label>
                  <textarea rows={3} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                </div>
              </div>

              <button type="button" onClick={assignTask} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-black">Assign task</button>

              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Assigned tasks</h4>
                {(selectedVolunteer.tasks || []).length > 0 ? selectedVolunteer.tasks.map((task: VolunteerTask) => (
                  <div key={task.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-black text-slate-900">{task.title}</div>
                        <div className="text-sm text-slate-500">{task.description}</div>
                      </div>
                      <button type="button" onClick={() => deleteVolunteerTask(selectedVolunteer.id, task.id)} className="text-[10px] font-black uppercase tracking-widest text-rose-600">Remove</button>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <input type="range" min={0} max={100} value={task.progress} onChange={e => updateTaskProgress(selectedVolunteer.id, task.id, Number(e.target.value))} className="w-full" />
                      <span className="text-xs font-black text-slate-500">{task.progress}%</span>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500">No tasks assigned yet.</p>}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Performance report</h4>
              <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-slate-50 p-3"><div className="text-2xl font-black">{(selectedVolunteer.tasks || []).length}</div><div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Tasks</div></div>
                <div className="rounded-lg bg-slate-50 p-3"><div className="text-2xl font-black">{(selectedVolunteer.documents || []).length}</div><div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Documents</div></div>
              </div>
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Performance score</label>
                  <input type="range" min={1} max={10} value={performanceScore} onChange={e => setPerformanceScore(Number(e.target.value))} className="w-full" />
                  <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{performanceScore}/10</div>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Performance notes</label>
                  <textarea rows={4} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" value={performanceNote} onChange={e => setPerformanceNote(e.target.value)} placeholder="Write a short review of the volunteer's contribution" />
                </div>
                <button type="button" onClick={savePerformance} className="rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-blue-700">Save performance</button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Certificates & letters</h4>
              <div className="mt-3 grid gap-3">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Document type</label>
                  <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" value={docForm.type} onChange={e => setDocForm({ ...docForm, type: e.target.value as VolunteerDocument['type'] })}>
                    <option value="certificate">Certificate of appreciation</option>
                    <option value="letter">Recommendation letter</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                  <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} placeholder="Volunteer recognition title" />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Reason</label>
                  <textarea rows={3} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" value={docForm.reason} onChange={e => setDocForm({ ...docForm, reason: e.target.value })} placeholder="Why this document is being issued" />
                </div>
                <button type="button" onClick={issueDocument} className="rounded-lg bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-emerald-700">Issue document</button>
              </div>

              <div className="mt-4 space-y-2">
                {(selectedVolunteer.documents || []).length > 0 ? selectedVolunteer.documents.map((doc: VolunteerDocument) => (
                  <div key={doc.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="font-black text-slate-900">{doc.title}</div>
                    <div className="text-sm text-slate-500">{doc.type} • {doc.issueDate}</div>
                  </div>
                )) : <p className="text-sm text-slate-500">No certificates or letters issued yet.</p>}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Task library</h4>
              <div className="mt-3 grid gap-3">
                <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" placeholder="Template title" value={libraryForm.title} onChange={e => setLibraryForm({ ...libraryForm, title: e.target.value })} />
                <textarea rows={3} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" placeholder="Template description" value={libraryForm.description} onChange={e => setLibraryForm({ ...libraryForm, description: e.target.value })} />
                <input type="number" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-500" value={libraryForm.durationDays} onChange={e => setLibraryForm({ ...libraryForm, durationDays: Number(e.target.value) })} />
                <button type="button" onClick={saveLibraryTask} className="rounded-lg bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">Add template</button>
              </div>
              <div className="mt-4 space-y-2">
                {taskLibrary.map(task => (
                  <div key={task.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="font-black text-slate-900">{task.title}</div>
                    <div className="text-sm text-slate-500">{task.description}</div>
                    <button type="button" onClick={() => deleteLibraryTask(task.id)} className="mt-2 text-[10px] font-black uppercase tracking-widest text-rose-600">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; tone: 'orange' | 'emerald' | 'blue' | 'slate' }> = ({ label, value, tone }) => {
  const toneClasses = {
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    slate: 'bg-slate-50 text-slate-600',
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-black text-slate-900">{value}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClasses}`}>
          <i className="fas fa-hands-helping" />
        </div>
      </div>
    </div>
  );
};

export default VolunteerManager;
