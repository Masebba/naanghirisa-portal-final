
import React, { useState } from 'react';
import { COLORS } from '../../constants';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'Naanghirisa Organisation',
    maintenanceMode: false,
    allowDonorSignups: true,
    notificationEmails: 'admin@naanghirisa.org',
    primaryCurrency: 'USD',
    sessionTimeout: 60
  });

  const handleSave = () => {
    alert('System configurations saved successfully!');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>System Settings</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Platform-wide configurations and security</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl flex items-center gap-3"
        >
          <i className="fas fa-shield-halved"></i> Apply Global Settings
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <i className="fas fa-globe text-orange-500"></i> General Meta
           </h3>
           <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Portal Site Name</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Notification Email</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold" value={settings.notificationEmails} onChange={e => setSettings({...settings, notificationEmails: e.target.value})} />
              </div>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <i className="fas fa-lock text-orange-500"></i> Access Controls
           </h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                 <div>
                    <p className="font-bold text-slate-900">Maintenance Mode</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Block public access to website</p>
                 </div>
                 <button 
                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-200'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
                 </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                 <div>
                    <p className="font-bold text-slate-900">Donor Registration</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Allow new donors to signup via portal</p>
                 </div>
                 <button 
                    onClick={() => setSettings({...settings, allowDonorSignups: !settings.allowDonorSignups})}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.allowDonorSignups ? 'bg-emerald-500' : 'bg-slate-200'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowDonorSignups ? 'right-1' : 'left-1'}`}></div>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
