
import React, { useState } from 'react';
import { getPageContent, updatePageContent } from '../../services/mockData';
import { COLORS } from '../../constants';

const ContentManager: React.FC = () => {
  const [content, setContent] = useState(getPageContent());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    updatePageContent(content);
    setTimeout(() => {
      setIsSaving(false);
      alert('Global website content updated successfully!');
    }, 800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent({ ...content, heroImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Home & Global Content</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage main page and global footer elements</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          PUBLISH CHANGES
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Hero Section */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-rocket"></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Hero Banner</h3>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Main Headline</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
              value={content.heroTitle}
              onChange={e => setContent({...content, heroTitle: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sub-Headline / Description</label>
            <textarea 
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-slate-600 leading-relaxed" 
              value={content.heroDescription}
              onChange={e => setContent({...content, heroDescription: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hero Background Image</label>
            <div className="relative group">
              <div className="w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border border-dashed border-slate-300 flex items-center justify-center relative">
                {content.heroImage ? (
                  <img src={content.heroImage} className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-image text-slate-300 text-3xl"></i>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <span className="px-4 py-2 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase">
                    Replace Hero Image
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-rectangle-list"></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Global Footer</h3>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Organisation Bio (Short)</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-slate-600" 
              value={content.footerDescription}
              onChange={e => setContent({...content, footerDescription: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Footer Email</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
                value={content.footerEmail}
                onChange={e => setContent({...content, footerEmail: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Footer Phone</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
                value={content.footerPhone}
                onChange={e => setContent({...content, footerPhone: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Footer Address</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
              value={content.footerAddress}
              onChange={e => setContent({...content, footerAddress: e.target.value})}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
