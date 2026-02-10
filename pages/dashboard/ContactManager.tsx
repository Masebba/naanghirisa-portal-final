
import React, { useState } from 'react';
import { getPageContent, updatePageContent } from '../../services/mockData';
import { COLORS } from '../../constants';

const ContactManager: React.FC = () => {
  const [content, setContent] = useState(getPageContent());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    updatePageContent(content);
    setTimeout(() => {
      setIsSaving(false);
      alert('Contact information updated across the platform!');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Contact Manager</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage office details and enquiry channels</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          SAVE CONTACT DATA
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Communication Channels */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-headset"></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Communication</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Support Email</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
                value={content.contactEmailSupport}
                onChange={e => setContent({...content, contactEmailSupport: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Enquiry Email</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
                value={content.contactEmailEnquiry}
                onChange={e => setContent({...content, contactEmailEnquiry: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phone Channel 1</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
                value={content.contactPhone1}
                onChange={e => setContent({...content, contactPhone1: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phone Channel 2</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
                value={content.contactPhone2}
                onChange={e => setContent({...content, contactPhone2: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Physical Presence */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-map-location-dot"></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Physical Presence</h3>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Office Headquarters Address</label>
            <textarea 
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-slate-600 leading-relaxed font-bold" 
              value={content.contactAddress}
              onChange={e => setContent({...content, contactAddress: e.target.value})}
            />
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">Location Preview</p>
             <p className="text-center font-black text-slate-900 text-sm italic">"{content.contactAddress}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
