import React, { useEffect, useState } from 'react';
import { COLORS } from '../../constants';
import { getSystemSettings, subscribeStoreUpdates, updateSystemSettings } from '../../services/mockData';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>(getSystemSettings());
  useEffect(() => subscribeStoreUpdates(() => setSettings(getSystemSettings())), []);

  const handleSave = () => {
    updateSystemSettings(settings);
    alert('System settings updated successfully.');
  };

  const Toggle = ({ label, keyName, hint }: { label: string; keyName: string; hint: string }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
      <div><p className="font-bold text-slate-900">{label}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{hint}</p></div>
      <button onClick={() => setSettings({ ...settings, [keyName]: !settings[keyName] })} className={`w-12 h-6 rounded-full relative transition-colors ${settings[keyName] ? 'bg-emerald-500' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[keyName] ? 'right-1' : 'left-1'}`}></div>
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>System Settings</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Platform-wide configurations and security</p></div>
        <button onClick={handleSave} className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl flex items-center gap-3"><i className="fas fa-shield-halved"></i> Save Settings</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><i className="fas fa-globe text-orange-500"></i> General</h3>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold" value={settings.siteName || ''} onChange={e => setSettings({ ...settings, siteName: e.target.value })} placeholder="Site name" />
          <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold" value={settings.notificationEmails || ''} onChange={e => setSettings({ ...settings, notificationEmails: e.target.value })} placeholder="Notification email(s)" />
          <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold" value={settings.primaryCurrency || ''} onChange={e => setSettings({ ...settings, primaryCurrency: e.target.value })} placeholder="Primary currency" />
          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none font-bold" value={settings.sessionTimeout || 60} onChange={e => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })} placeholder="Session timeout" />
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><i className="fas fa-lock text-orange-500"></i> Access</h3>
          <Toggle label="Maintenance Mode" keyName="maintenanceMode" hint="Block public access to website" />
          <Toggle label="Donor Registration" keyName="allowDonorSignups" hint="Allow donor registration" />
          <Toggle label="Volunteer Applications" keyName="allowVolunteerApplications" hint="Allow volunteer application submissions" />
          <Toggle label="Public Registration" keyName="publicRegistrationEnabled" hint="Allow public signups" />
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
