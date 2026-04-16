
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns, addCampaign, updateCampaign, deleteCampaign } from '../../services/mockData';
import { Campaign, UserRole } from '../../types';
import { downloadJson } from '../../services/fileExport';
import { COLORS } from '../../constants';
import { authService } from '../../services/authService';

const CampaignsManager: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdminOrStaff = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user?.role as UserRole);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Campaign>>({});

  useEffect(() => {
    setCampaigns([...getCampaigns()]);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (editingId === 'new') {
      const newCamp: Campaign = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'Active',
        amountRaised: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        image: formData.image || 'https://placehold.co/800x600?text=Campaign'
      } as Campaign;
      addCampaign(newCamp);
    } else {
      updateCampaign(formData as Campaign);
    }
    setCampaigns([...getCampaigns()]);
    setEditingId(null);
  };

  const handleEdit = (c: Campaign) => {
    setEditingId(c.id);
    setFormData(c);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this campaign? All associated data will be archived.')) {
      deleteCampaign(id);
      setCampaigns([...getCampaigns()]);
    }
  };

  const handleShare = (camp: Campaign, platform: string) => {
      const shareUrl = `${window.location.origin}/campaigns/${camp.id}`;
      const text = `Join me in supporting Naanghirisa's mission: ${camp.name}. Help us reach our goal of $${camp.targetAmount}!`;
      
      let url = '';
      if (platform === 'whatsapp') url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
      if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      if (platform === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      
      window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>
            {isAdminOrStaff ? 'Campaigns CMS' : 'Active Campaign Goals'}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            {isAdminOrStaff ? 'Manage direct community funding initiatives' : 'Share our goals with your network and help us drive impact'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => downloadJson('campaigns-backup', campaigns)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest">Backup JSON</button>
          {isAdminOrStaff && (
            <button 
              onClick={() => { setEditingId('new'); setFormData({}); }}
              className="px-6 py-3 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-all text-[10px] uppercase tracking-widest"
            >
              Create Campaign
            </button>
          )}
        </div>
      </div>

      {isAdminOrStaff && editingId && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tighter">{editingId === 'new' ? 'New Fundraising Goal' : 'Edit Campaign'}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Campaign Name</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Amount ($)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                  value={formData.targetAmount || ''} 
                  onChange={e => setFormData({...formData, targetAmount: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Purpose Statement</label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500" 
                  value={formData.purpose || ''} 
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                />
              </div>
            </div>
            
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Campaign Banner</label>
               <div className="relative group">
                  <div className="w-full h-72 bg-slate-100 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center relative">
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400">
                         <i className="fas fa-bullhorn text-5xl mb-4"></i>
                         <p className="text-[10px] font-black uppercase tracking-widest">No Banner Uploaded</p>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest">
                         <i className="fas fa-camera mr-2"></i> Select File
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
               </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button onClick={handleSave} className="px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black">Save & Publish</button>
            <button onClick={() => setEditingId(null)} className="px-10 py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200">Discard</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map(c => {
          const progress = (c.amountRaised / c.targetAmount) * 100;
          return (
            <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
               <div className="h-44 relative">
                  <img src={c.image} className="w-full h-full object-cover" alt={c.name} />
                  {isAdminOrStaff && (
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button onClick={() => handleEdit(c)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-xs text-slate-900 shadow-lg"><i className="fas fa-edit"></i></button>
                       <button onClick={() => handleDelete(c.id)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-xs text-red-600 shadow-lg"><i className="fas fa-trash"></i></button>
                    </div>
                  )}
               </div>
               <div className="p-8 flex-grow flex flex-col">
                  <h4 className="font-black text-slate-900 text-lg mb-2 line-clamp-1">{c.name}</h4>
                  <p className="text-slate-500 text-xs mb-6 line-clamp-2 font-medium">{c.purpose}</p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Funded</p>
                          <p className="text-xl font-black text-orange-600">{Math.round(progress)}%</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                          <p className="text-sm font-black text-slate-900">${c.targetAmount.toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-50 mt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Promote & Advocate</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleShare(c, 'whatsapp')} className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><i className="fab fa-whatsapp"></i></button>
                            <button onClick={() => handleShare(c, 'facebook')} className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"><i className="fab fa-facebook-f"></i></button>
                            <button onClick={() => handleShare(c, 'twitter')} className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all shadow-sm"><i className="fab fa-twitter"></i></button>
                            <Link to={`/campaigns/${c.id}`} className="flex-grow flex items-center justify-center bg-slate-100 text-slate-900 text-[9px] font-black uppercase rounded-lg hover:bg-slate-200 border border-slate-200">View Page</Link>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignsManager;
