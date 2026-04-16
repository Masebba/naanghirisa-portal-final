
import React, { useEffect, useState } from 'react';
import { addLeader, deleteLeader, getLeaders, getPageContent, subscribeStoreUpdates, updatePageContent, updateLeader } from '../../services/mockData';
import { COLORS } from '../../constants';
import { notify } from '../../services/notifications';
import { Leader } from '../../types';

const AboutManager: React.FC = () => {
  const [content, setContent] = useState(getPageContent());
  const [leaders, setLeaders] = useState<Leader[]>(getLeaders());
  const [isSaving, setIsSaving] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Partial<Leader> | null>(null);
  useEffect(() => subscribeStoreUpdates(() => { setContent(getPageContent()); setLeaders(getLeaders()); }), []);

  const handleSave = () => {
    setIsSaving(true);
    updatePageContent(content);
    // In a real app, you'd also save leaders
    setIsSaving(false);
    notify('About page content updated!');
  };

  const handleImageUpload = (key: 'aboutJourneyImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent({ ...content, [key]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingLeader) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingLeader({ ...editingLeader, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveLeader = () => {
    if (editingLeader) {
      const payload = {
        id: String(editingLeader.id || `leader_${Date.now()}`),
        name: String(editingLeader.name || '').trim(),
        role: String(editingLeader.role || '').trim(),
        profile: String(editingLeader.profile || '').trim(),
        image: String(editingLeader.image || ''),
      } as Leader;

      if (editingLeader.id) {
        updateLeader(payload);
      } else {
        addLeader(payload);
      }

      setLeaders(getLeaders());
      setEditingLeader(null);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>About Manager</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Refine your story and principles</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          UPDATE ABOUT CONTENT
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Core Identity */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-900 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-bullseye"></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Core Identity</h3>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Our Mission Statement</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-slate-600" 
              value={content.aboutMission}
              onChange={e => setContent({...content, aboutMission: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Our Vision Statement</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-slate-600" 
              value={content.aboutVision}
              onChange={e => setContent({...content, aboutVision: e.target.value})}
            />
          </div>
        </div>

        {/* Narrative Section */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-book-open"></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">The Narrative</h3>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">The Story Behind Formation</label>
            <textarea 
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-slate-600 leading-relaxed" 
              value={content.aboutStory}
              onChange={e => setContent({...content, aboutStory: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Narrative Image</label>
            <div className="relative group">
               <div className="w-full h-32 bg-slate-100 rounded-2xl border border-dashed border-slate-300 overflow-hidden flex items-center justify-center">
                  {content.aboutJourneyImage ? (
                    <img src={content.aboutJourneyImage} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-image text-slate-300"></i>
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-[9px] font-black uppercase bg-white px-3 py-1 rounded-lg">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload('aboutJourneyImage', e)} />
                  </label>
               </div>
            </div>
          </div>
        </div>

        {/* Leadership Section */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter">Leadership Team</h3>
              <button 
                onClick={() => setEditingLeader({ name: '', role: '', profile: '', image: '' })}
                className="px-5 py-2.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black"
              >
                Add New Leader
              </button>
           </div>

           {editingLeader && (
             <div className="mb-8 p-8 bg-slate-50 border border-slate-200 rounded-[2rem] animate-in zoom-in-95">
                <h4 className="font-black text-sm uppercase mb-6 tracking-widest">
                  {editingLeader.id ? 'Edit' : 'Create'} Leadership Profile
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                   <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Name</label>
                        <input className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={editingLeader.name || ''} onChange={e => setEditingLeader({...editingLeader, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Role</label>
                        <input className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" value={editingLeader.role || ''} onChange={e => setEditingLeader({...editingLeader, role: e.target.value})} />
                      </div>
                   </div>
                   <div className="md:col-span-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Photo</label>
                      <div className="h-32 bg-white border border-dashed border-slate-300 rounded-2xl overflow-hidden relative group">
                        {editingLeader.image ? (
                          <img src={editingLeader.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-300">
                             <i className="fas fa-camera text-2xl"></i>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                           <span className="bg-white px-3 py-1 rounded-lg text-[9px] font-black uppercase">Select</span>
                           <input type="file" className="hidden" accept="image/*" onChange={handleLeaderImageUpload} />
                        </label>
                      </div>
                   </div>
                   <div className="md:col-span-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Short Bio</label>
                      <textarea rows={3} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" value={editingLeader.profile || ''} onChange={e => setEditingLeader({...editingLeader, profile: e.target.value})} />
                   </div>
                </div>
                <div className="flex gap-4 mt-6">
                   <button onClick={saveLeader} className="px-6 py-2.5 bg-orange-600 text-white font-black text-[10px] uppercase rounded-xl">Confirm Member</button>
                   <button onClick={() => setEditingLeader(null)} className="px-6 py-2.5 bg-slate-200 text-slate-500 font-black text-[10px] uppercase rounded-xl">Cancel</button>
                </div>
             </div>
           )}

           <div className="grid md:grid-cols-3 gap-6">
              {leaders.map(leader => (
                <div key={leader.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center gap-4 group">
                   <img src={leader.image} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                   <div className="overflow-hidden">
                      <p className="font-black text-slate-900 text-sm truncate">{leader.name}</p>
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest truncate">{leader.role}</p>
                   </div>
                   <div className="ml-auto flex gap-2">
                      <button onClick={() => setEditingLeader(leader)} className="text-slate-300 hover:text-blue-500"><i className="fas fa-edit"></i></button>
                      <button onClick={() => { deleteLeader(leader.id); setLeaders(getLeaders()); }} className="text-slate-300 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutManager;
