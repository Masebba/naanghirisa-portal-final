
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getVolunteers, updateVolunteerStatus, updateTaskProgress, addNotification, getTaskLibrary, addLibraryTask, deleteLibraryTask, awardVolunteerDocument, upsertVolunteerTask, deleteVolunteerTask } from '../../services/mockData';
import { COLORS, BRAND } from '../../constants';
import { authService } from '../../services/authService';
import { UserRole, VolunteerTask, LibraryTask, VolunteerDocument } from '../../types';

const VolunteerManager: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdminOrManager = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user?.role as UserRole);

  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [taskLibrary, setTaskLibrary] = useState<LibraryTask[]>([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<VolunteerDocument | null>(null);

  const [activeManagerTab, setActiveManagerTab] = useState<'Approved' | 'Pending' | 'Rejected'>('Approved');
  const [activeVolunteerTab, setActiveVolunteerTab] = useState<'My Missions' | 'Mission Board' | 'Recognition'>('My Missions');
  const [activeWorkspace, setActiveWorkspace] = useState<'Oversight' | 'Library'>('Oversight');

  const [taskMode, setTaskMode] = useState<'library' | 'custom'>('library');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [awardData, setAwardData] = useState<Omit<VolunteerDocument, 'id' | 'issueDate' | 'referenceNo'>>({
    type: 'certificate',
    title: 'Certificate of Excellence',
    reason: 'Outstanding contribution to community welfare.',
    issuedBy: user?.name || 'Directorate'
  });

  const [newTask, setNewTask] = useState({
    volunteerId: '',
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 12096e5).toISOString().split('T')[0],
    progress: 0
  });

  const [newLibTemplate, setNewLibTemplate] = useState({ title: '', description: '', durationDays: 7 });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rawVolunteers = getVolunteers();
    setVolunteers(rawVolunteers);
    setTaskLibrary(getTaskLibrary());

    if (!isAdminOrManager) {
      const myProfile = rawVolunteers.find(v => v.email === user?.email);
      if (myProfile) setSelectedVolunteerId(myProfile.id);
    }
  }, [isAdminOrManager, user?.email]);

  const currentVolunteer = useMemo(() => volunteers.find(v => v.id === selectedVolunteerId), [volunteers, selectedVolunteerId]);
  const filteredList = useMemo(() => volunteers.filter(v => v.status === activeManagerTab), [volunteers, activeManagerTab]);

  const handleStatusChange = (id: string, newStatus: string) => {
    updateVolunteerStatus(id, newStatus);
    setVolunteers([...getVolunteers()]);
    addNotification({ userId: id, title: 'Personnel Status Updated', message: `Your status has been updated to: ${newStatus}.`, type: 'status' });
    alert(`Status updated to: ${newStatus}`);
  };

  const handleAwardRecognition = () => {
    if (!selectedVolunteerId) return;
    awardVolunteerDocument(selectedVolunteerId, awardData);
    setVolunteers([...getVolunteers()]);
    setShowAwardModal(false);
    alert(`${awardData.type === 'certificate' ? 'Certificate' : 'Recommendation Letter'} awarded successfully.`);
  };

  const handleAddTask = () => {
    const targetId = newTask.volunteerId || selectedVolunteerId;
    if (!targetId || !newTask.title || !newTask.startDate || !newTask.endDate) {
      alert("Please ensure all fields are provided.");
      return;
    }
    const taskData: VolunteerTask = {
      id: editingTaskId || `t${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      progress: newTask.progress,
      status: newTask.progress === 100 ? 'Completed' : 'In Progress',
      assignedTo: targetId
    };

    upsertVolunteerTask(targetId, taskData);
    setVolunteers([...getVolunteers()]);

    if (!editingTaskId) {
      addNotification({
        userId: targetId,
        title: 'New Mission Assigned',
        message: `Directives for "${newTask.title}" have been deployed to your profile.`,
        type: 'mission'
      });
    }

    setShowTaskModal(false);
    setEditingTaskId(null);
    setNewTask({ volunteerId: '', title: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', progress: 0 });
    alert(editingTaskId ? "Mission updated." : "Mission deployed.");
  };

  const handleEditTask = (task: VolunteerTask) => {
    setEditingTaskId(task.id);
    setTaskMode('custom');
    setNewTask({ volunteerId: selectedVolunteerId || '', title: task.title, description: task.description, startDate: task.startDate, endDate: task.endDate, progress: task.progress });
    setShowTaskModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedVolunteerId || !confirm("Retract this mission permanently?")) return;
    deleteVolunteerTask(selectedVolunteerId, taskId);
    setVolunteers([...getVolunteers()]);
  };

  const handleEnlist = (libTask: LibraryTask) => {
    if (!selectedVolunteerId) return;
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + libTask.durationDays);
    const assignedTask: VolunteerTask = {
      id: `t${Date.now()}`, title: libTask.title, description: libTask.description, startDate: today.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0], progress: 0, status: 'In Progress', assignedTo: selectedVolunteerId
    };

    upsertVolunteerTask(selectedVolunteerId, assignedTask);
    setVolunteers([...getVolunteers()]);

    addNotification({ userId: selectedVolunteerId, title: 'Enlistment Confirmed', message: `You are now assigned to: "${libTask.title}".`, type: 'mission' });
    alert(`Enlisted: ${libTask.title}`);
  };

  const handleAddTemplate = () => {
    if (!newLibTemplate.title || !newLibTemplate.description) return;
    addLibraryTask(newLibTemplate);
    setTaskLibrary(getTaskLibrary());
    setShowLibraryModal(false);
    setNewLibTemplate({ title: '', description: '', durationDays: 7 });
  };

  const handleDeleteTemplate = (id: string) => { if (confirm("Remove template?")) { deleteLibraryTask(id); setTaskLibrary(getTaskLibrary()); } };

  const handleLocalProgressUpdate = (taskId: string, progress: number) => {
    if (!selectedVolunteerId) return;
    updateTaskProgress(selectedVolunteerId, taskId, progress);
    setVolunteers([...getVolunteers()]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>{isAdminOrManager ? 'Field Operations Hub' : 'Volunteer Personnel Center'}</h2>
          <p className="text-slate-400 text-[10px] font-black tracking-widest mt-1">{isAdminOrManager ? 'Directives & Personnel Deployment' : 'Active Missions & Direct Field Reporting'}</p>
        </div>
        {isAdminOrManager && (
          <div className="flex gap-4">
            <button onClick={() => setShowLibraryModal(true)} className="px-3 py-2 bg-slate-900 text-white font-black rounded-lg hover:bg-black transition-all text-[10px] uppercase tracking-widest shadow-xl"><i className="fas fa-book mr-2"></i> New Template</button>
            <button onClick={() => { setEditingTaskId(null); setNewTask({ ...newTask, volunteerId: selectedVolunteerId || '', title: '', description: '', progress: 0 }); setShowTaskModal(true); }} className="px-6 py-3 bg-orange-600 text-white font-black rounded-lg hover:bg-orange-700 transition-all text-[10px] uppercase tracking-widest shadow-xl shadow-orange-100"><i className="fas fa-plus mr-2"></i> Deploy Mission</button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-4">
        {isAdminOrManager && (
          <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col h-fit sticky top-28">
            <div className="bg-slate-50/50 border-b border-slate-100 p-2 flex">
              {(['Approved', 'Pending', 'Rejected'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveManagerTab(tab)} className={`flex-grow py-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeManagerTab === tab ? 'bg-white shadow-sm rounded-lg text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'Approved' ? 'Active Team' : tab === 'Pending' ? 'Applicants' : 'Archive'}
                </button>
              ))}
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredList.map(v => (
                <div key={v.id} onClick={() => setSelectedVolunteerId(v.id)} className={`p-3 cursor-pointer transition-all hover:bg-slate-50 flex items-center justify-between group ${selectedVolunteerId === v.id ? 'bg-orange-50/50 border-l-4 border-orange-500' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">{v.name.charAt(0)}</div>
                    <div><p className="font-bold text-slate-900 text-sm">{v.name}</p><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{v.joinedDate}</p></div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[7px] font-black border ${getStatusColor(v.status)}`}>{v.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={isAdminOrManager ? 'lg:col-span-8' : 'lg:col-span-12'}>
          {isAdminOrManager && (
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex max-w-sm mb-4">
              {(['Oversight', 'Library'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveWorkspace(tab)} className={`flex-grow py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeWorkspace === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>{tab === 'Oversight' ? 'Field Oversight' : 'Mission Templates'}</button>
              ))}
            </div>
          )}

          {isAdminOrManager && activeWorkspace === 'Library' ? (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-10"><h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Template Library</h4></div>
              <div className="grid md:grid-cols-2 gap-3">
                {taskLibrary.map(lt => (
                  <div key={lt.id} className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-col group hover:border-orange-200 transition-all">
                    <div className="flex justify-between items-start mb-3"><h4 className="font-black text-slate-900 uppercase leading-tight">{lt.title}</h4><button onClick={() => handleDeleteTemplate(lt.id)} className="text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><i className="fas fa-trash-alt"></i></button></div>
                    <p className="text-slate-500 text-[11px] leading-relaxed mb-4 flex-grow">{lt.description}</p>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 tracking-widest">Est. Duration: {lt.durationDays} Days</span></div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentVolunteer ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-900 rounded-lg flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden border-4 border-white ring-2 ring-slate-50">
                    {currentVolunteer.avatar ? <img src={currentVolunteer.avatar} className="w-full h-full object-cover" alt="" /> : currentVolunteer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{currentVolunteer.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-3 py-0.5 rounded text-[9px] font-black border ${getStatusColor(currentVolunteer.status)}`}>{currentVolunteer.status} Personnel</span>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest">Enlisted {currentVolunteer.joinedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdminOrManager ? (
                    <>
                      {currentVolunteer.status === 'Approved' && <button onClick={() => setShowAwardModal(true)} className="px-6 py-3 bg-slate-900 text-white font-black text-[9px] uppercase rounded-lg hover:bg-black transition-all shadow-lg"><i className="fas fa-award mr-2"></i> Award Recognition</button>}
                      {currentVolunteer.status === 'Pending' && <button onClick={() => handleStatusChange(currentVolunteer.id, 'Approved')} className="px-6 py-3 bg-emerald-600 text-white font-black text-[9px] rounded-lg hover:bg-emerald-700 transition-all shadow-lg">Approve Access</button>}
                      {currentVolunteer.status !== 'Rejected' && <button onClick={() => handleStatusChange(currentVolunteer.id, 'Rejected')} className="px-6 py-3 bg-slate-100 text-slate-600 font-black text-[9px] rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all">Archive Profile</button>}
                    </>
                  ) : (
                    <div className="flex gap-3"><Link to="/dashboard/donations" className="px-3 py-2 bg-orange-600 text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-orange-700 transition-all shadow-lg"><i className="fas fa-heart mr-2"></i> Contribute</Link><button onClick={() => setActiveVolunteerTab('Recognition')} className="px-3 py-3 bg-slate-900 text-white font-black text-[9px] tracking-widest rounded-lg hover:bg-black transition-all shadow-lg"><i className="fas fa-certificate mr-2"></i> Portfolio</button></div>
                  )}
                </div>
              </div>

              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex max-w-md">
                {(['My Missions', 'Mission Board', 'Recognition'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveVolunteerTab(tab)} className={`flex-grow py-3 text-[10px] font-black tracking-widest rounded-lg transition-all ${activeVolunteerTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>{tab}</button>
                ))}
              </div>

              {activeVolunteerTab === 'Mission Board' ? (
                <div className="grid md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {taskLibrary.map(libTask => (
                    <div key={libTask.id} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex flex-col group hover:border-orange-200 transition-all">
                      <div className="flex justify-between items-start mb-3"><h4 className="font-black text-slate-900 uppercase tracking-tight">{libTask.title}</h4><span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-100">Open Mission</span></div>
                      <p className="text-slate-500 text-[11px] mb-8 leading-relaxed flex-grow">{libTask.description}</p>
                      <div className="pt-3 border-t border-slate-50 flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. {libTask.durationDays} Days</span><button onClick={() => handleEnlist(libTask)} className="px-6 py-2 bg-slate-900 text-white font-black text-[9px] uppercase rounded-xl hover:bg-black shadow-lg">Enlist Now</button></div>
                    </div>
                  ))}
                </div>
              ) : activeVolunteerTab === 'Recognition' ? (
                <div className="bg-white p-10 rounded-lg border border-slate-200 shadow-sm animate-in fade-in duration-500">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Honors & Awards</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {currentVolunteer.documents && currentVolunteer.documents.length > 0 ? currentVolunteer.documents.map((doc: VolunteerDocument) => (
                      <div key={doc.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex flex-col gap-6 group hover:border-orange-200 transition-all">
                        <div className="flex justify-between items-start"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl text-orange-500 shadow-sm"><i className={doc.type === 'certificate' ? 'fas fa-certificate' : 'fas fa-file-contract'}></i></div><span className="text-[9px] font-black uppercase text-slate-400">{doc.issueDate}</span></div>
                        <div><h5 className="font-black text-slate-900 uppercase tracking-tight">{doc.title}</h5><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ref: {doc.referenceNo}</p></div>
                        <button onClick={() => { setSelectedDoc(doc); setShowDocViewer(true); }} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">View & Print</button>
                      </div>
                    )) : (
                      <div className="md:col-span-2 py-20 text-center"><i className="fas fa-award text-4xl text-slate-200 mb-4"></i><p className="text-slate-400 font-black text-xs uppercase">No recognitions issued.</p></div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Directives Registry</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {currentVolunteer.tasks && currentVolunteer.tasks.length > 0 ? currentVolunteer.tasks.map((task: VolunteerTask) => (
                      <div key={task.id} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col group hover:border-orange-200 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1"><h4 className="font-black text-slate-900 uppercase leading-tight">{task.title}</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.startDate} $\rightarrow$ {task.endDate}</p></div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{task.status}</span>
                            {isAdminOrManager && <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEditTask(task)} className="text-[10px] text-blue-600 hover:underline font-bold">Edit</button><button onClick={() => handleDeleteTask(task.id)} className="text-[10px] text-red-600 hover:underline font-bold">Delete</button></div>}
                          </div>
                        </div>
                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-8 flex-grow">{task.description}</p>
                        <div className="space-y-4 pt-6 border-t border-slate-200">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500"><span>Field Progress</span><span className="text-orange-600 font-black">{task.progress}%</span></div>
                          <div className="flex items-center gap-4"><input type="range" min="0" max="100" value={task.progress} onChange={(e) => handleLocalProgressUpdate(task.id, parseInt(e.target.value))} className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" /></div>
                        </div>
                      </div>
                    )) : (
                      <div className="md:col-span-2 py-20 text-center"><p className="text-slate-400 font-black text-xs uppercase">No missions assigned.</p></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300"><i className="fas fa-user-check text-5xl mb-6"></i><p className="font-black text-xs uppercase tracking-widest">Select field personnel to manage directives</p></div>
          )}
        </div>
      </div>

      {/* Award Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 md:p-14 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-10"><h3 className="text-2xl font-black uppercase tracking-tighter">Award Recognition</h3><button onClick={() => setShowAwardModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"><i className="fas fa-times"></i></button></div>
            <div className="space-y-6">
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recognition Type</label><div className="grid grid-cols-2 gap-4"><button onClick={() => setAwardData({ ...awardData, type: 'certificate', title: 'Certificate of Excellence' })} className={`py-4 rounded-xl font-black text-[10px] uppercase border transition-all ${awardData.type === 'certificate' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>Certificate</button><button onClick={() => setAwardData({ ...awardData, type: 'letter', title: 'Recommendation Letter' })} className={`py-4 rounded-xl font-black text-[10px] uppercase border transition-all ${awardData.type === 'letter' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>Letter</button></div></div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label><input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold" value={awardData.title} onChange={e => setAwardData({ ...awardData, title: e.target.value })} /></div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason</label><textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4" value={awardData.reason} onChange={e => setAwardData({ ...awardData, reason: e.target.value })} /></div>
              <div className="flex gap-4"><button onClick={handleAwardRecognition} className="flex-grow py-5 bg-orange-600 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-orange-700 shadow-xl transition-all">Confirm Award</button><button onClick={() => setShowAwardModal(false)} className="flex-grow py-5 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-2xl">Cancel</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      {showDocViewer && selectedDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[1.5rem] shadow-2xl relative my-auto animate-in zoom-in-95">
            <button onClick={() => setShowDocViewer(false)} className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-slate-100 transition-all z-20 no-print"><i className="fas fa-times"></i></button>
            <div className="p-20 flex flex-col items-center text-center">
              {selectedDoc.type === 'certificate' ? (
                <div className="w-full border-[12px] border-orange-100 p-12 relative bg-[#fffdfa] min-h-[600px] flex flex-col justify-center shadow-inner">
                  <img src="https://raw.githubusercontent.com/Anas-Ali-Hub/Naanghirisa-Logo/main/logo.png" className="h-20 w-auto mx-auto mb-10" alt="" />
                  <h1 className="text-5xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Certificate</h1>
                  <p className="text-orange-500 text-lg font-black uppercase tracking-[0.3em] mb-12">OF APPRECIATION</p>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Presented to</p>
                  <h2 className="text-4xl font-black text-slate-950 mb-10 underline decoration-orange-300 decoration-4 underline-offset-8">{currentVolunteer?.name}</h2>
                  <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed italic font-medium">"{selectedDoc.reason}"</p>
                  <div className="grid grid-cols-2 gap-20 w-full px-20 mt-16"><div className="border-t-2 border-slate-300 pt-4"><p className="font-black text-slate-900 uppercase text-xs">{selectedDoc.issuedBy}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Field Ops Directorate</p></div><div className="border-t-2 border-slate-300 pt-4"><p className="font-black text-slate-900 uppercase text-xs">{selectedDoc.issueDate}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Date issued</p></div></div>
                  <p className="absolute bottom-6 left-6 text-[8px] font-black text-slate-300 uppercase tracking-widest">Ref: {selectedDoc.referenceNo}</p>
                </div>
              ) : (
                <div className="w-full bg-white p-12 text-left shadow-inner border border-slate-100">
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-12"><img src="https://raw.githubusercontent.com/Anas-Ali-Hub/Naanghirisa-Logo/main/logo.png" className="h-16 w-auto" alt="" /><div className="text-right text-[10px] font-black uppercase leading-relaxed"><p>Naanghirisa Association</p><p>Butaleja, Uganda</p><p className="mt-2 text-orange-600">{selectedDoc.issueDate}</p></div></div>
                  <p className="font-black text-sm uppercase mb-10">To Whom It May Concern,</p>
                  <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">RECOMMENDATION FOR {currentVolunteer?.name}</h3>
                  <p className="prose prose-lg text-slate-700 leading-relaxed font-medium mb-6">This letter confirms that {currentVolunteer?.name} has served as a field volunteer since {currentVolunteer?.joinedDate}.</p>
                  <p className="prose prose-lg text-slate-700 leading-relaxed font-medium italic mb-10">"{selectedDoc.reason}"</p>
                  <div className="mt-16"><p className="font-black text-slate-900 uppercase text-xs">Best Regards,</p><div className="h-12 w-40 border-b-2 border-slate-100 relative"><span className="absolute bottom-2 left-0 font-serif italic text-2xl opacity-40">{selectedDoc.issuedBy}</span></div><p className="font-black text-slate-900 uppercase text-[10px] mt-4">{selectedDoc.issuedBy}</p></div>
                </div>
              )}
              <button onClick={() => window.print()} className="mt-10 px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl no-print hover:bg-black transition-all">Print Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black uppercase tracking-tighter">{editingTaskId ? 'Revise Directive' : 'Deploy Mission'}</h3><button onClick={() => { setShowTaskModal(false); setEditingTaskId(null); }} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"><i className="fas fa-times"></i></button></div>
            <div className="space-y-6">
              {!editingTaskId && <div className="p-1 bg-slate-100 rounded-xl flex mb-6"><button onClick={() => setTaskMode('library')} className={`flex-grow py-3 text-[9px] font-black uppercase rounded-lg transition-all ${taskMode === 'library' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}>Library</button><button onClick={() => setTaskMode('custom')} className={`flex-grow py-3 text-[9px] font-black uppercase rounded-lg transition-all ${taskMode === 'custom' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}>Custom</button></div>}
              {taskMode === 'library' && !editingTaskId ? <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Template</label><select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 outline-none font-bold" onChange={(e) => { const libTask = taskLibrary.find(lt => lt.id === e.target.value); if (libTask) { const today = new Date(); const end = new Date(); end.setDate(today.getDate() + libTask.durationDays); setNewTask({ ...newTask, title: libTask.title, description: libTask.description, endDate: end.toISOString().split('T')[0] }); } }}><option value="">Choose Template...</option>{taskLibrary.map(lt => <option key={lt.id} value={lt.id}>{lt.title}</option>)}</select></div> : <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mission Title</label><input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold outline-none" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} /></div>}
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instructions</label><textarea rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 outline-none" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start</label><input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold text-xs" value={newTask.startDate} onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })} /></div><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End</label><input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold text-xs" value={newTask.endDate} onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })} /></div></div>
              <div className="flex gap-4 pt-6"><button onClick={handleAddTask} className="flex-grow py-5 bg-orange-600 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-orange-700 shadow-xl transition-all">{editingTaskId ? 'Commit changes' : 'Deploy Directive'}</button><button onClick={() => { setShowTaskModal(false); setEditingTaskId(null); }} className="flex-grow py-5 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-2xl hover:bg-slate-200">Discard</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black uppercase tracking-tighter">New Mission Template</h3><button onClick={() => setShowLibraryModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"><i className="fas fa-times"></i></button></div>
            <div className="space-y-6">
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Template Title</label><input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold" value={newLibTemplate.title} onChange={(e) => setNewLibTemplate({ ...newLibTemplate, title: e.target.value })} /></div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration (Days)</label><input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold" value={newLibTemplate.durationDays} onChange={(e) => setNewLibTemplate({ ...newLibTemplate, durationDays: parseInt(e.target.value) })} /></div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Guidelines</label><textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4" value={newLibTemplate.description} onChange={(e) => setNewLibTemplate({ ...newLibTemplate, description: e.target.value })} /></div>
              <div className="flex gap-4"><button onClick={handleAddTemplate} className="flex-grow py-5 bg-slate-900 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-black shadow-xl transition-all">Save Template</button><button onClick={() => setShowLibraryModal(false)} className="flex-grow py-5 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-2xl">Cancel</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerManager;
