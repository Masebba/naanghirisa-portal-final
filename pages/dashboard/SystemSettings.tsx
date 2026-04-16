import React, { useEffect, useState } from 'react';
import { COLORS } from '../../constants';
import { notify } from '../../services/notifications';
import { getSystemSettings, subscribeStoreUpdates, updateSystemSettings } from '../../services/mockData';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>(getSystemSettings());
  useEffect(() => subscribeStoreUpdates(() => setSettings(getSystemSettings())), []);

  const handleSave = () => {
    updateSystemSettings(settings);
    notify('System settings updated successfully.');
  };

  const Toggle = ({ label, keyName, hint }: { label: string; keyName: string; hint: string }) => (
    <button type="button" onClick={() => setSettings({ ...settings, [keyName]: !settings[keyName] })} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-left transition hover:bg-slate-100">
      <div>
        <p className="font-bold text-slate-900">{label}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{hint}</p>
      </div>
      <div className={`h-5 w-10 rounded-full relative transition-colors ${settings[keyName] ? 'bg-emerald-500' : 'bg-slate-200'}`}>
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${settings[keyName] ? 'right-0.5' : 'left-0.5'}`} />
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>System Settings</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Platform-wide configurations, access rules and notifications</p>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white font-black rounded-lg hover:bg-black transition-all shadow-lg flex items-center gap-2 text-[10px] uppercase tracking-widest">
          <i className="fas fa-shield-halved"></i> Save settings
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black uppercase tracking-tighter flex items-center gap-2"><i className="fas fa-globe text-orange-500"></i> General</h3>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.siteName || ''} onChange={e => setSettings({ ...settings, siteName: e.target.value })} placeholder="Site name" />
          <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.notificationEmails || ''} onChange={e => setSettings({ ...settings, notificationEmails: e.target.value })} placeholder="Notification email(s)" />
          <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.primaryCurrency || ''} onChange={e => setSettings({ ...settings, primaryCurrency: e.target.value })} placeholder="Primary currency" />
          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.sessionTimeout || 60} onChange={e => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })} placeholder="Session timeout" />
          <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.contactHours || ''} onChange={e => setSettings({ ...settings, contactHours: e.target.value })} placeholder="Contact hours" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black uppercase tracking-tighter flex items-center gap-2"><i className="fas fa-lock text-orange-500"></i> Access</h3>
          <Toggle label="Maintenance mode" keyName="maintenanceMode" hint="Block public access to website" />
          <Toggle label="Donor registration" keyName="allowDonorSignups" hint="Allow donor registration" />
          <Toggle label="Volunteer applications" keyName="allowVolunteerApplications" hint="Allow volunteer application submissions" />
          <Toggle label="Public registration" keyName="publicRegistrationEnabled" hint="Allow public signups" />
          <Toggle label="Notification emails" keyName="sendNotificationEmails" hint="Push email notifications when supported" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black uppercase tracking-tighter flex items-center gap-2"><i className="fas fa-envelope text-orange-500"></i> Messaging</h3>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.contactEmailSupport || ''} onChange={e => setSettings({ ...settings, contactEmailSupport: e.target.value })} placeholder="Support email" />
          <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.contactEmailEnquiry || ''} onChange={e => setSettings({ ...settings, contactEmailEnquiry: e.target.value })} placeholder="Enquiry email" />
          <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" rows={3} value={settings.footerDescription || ''} onChange={e => setSettings({ ...settings, footerDescription: e.target.value })} placeholder="Footer description" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-black uppercase tracking-tighter flex items-center gap-2"><i className="fas fa-user-shield text-orange-500"></i> Portal defaults</h3>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.defaultVolunteerPassword || 'Volunteer@123'} onChange={e => setSettings({ ...settings, defaultVolunteerPassword: e.target.value })} placeholder="Volunteer default password" />
          <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" value={settings.defaultRoleLabel || 'Portal user'} onChange={e => setSettings({ ...settings, defaultRoleLabel: e.target.value })} placeholder="Default role label" />
          <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold" rows={3} value={settings.sessionWarningText || ''} onChange={e => setSettings({ ...settings, sessionWarningText: e.target.value })} placeholder="Session warning text" />
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
