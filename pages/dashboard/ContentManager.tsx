import React, { useEffect, useState } from 'react';
import { getPageContent, subscribeStoreUpdates, updatePageContent } from '../../services/mockData';
import { COLORS } from '../../constants';

const ContentManager: React.FC = () => {
  const [content, setContent] = useState(getPageContent());
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => subscribeStoreUpdates(() => setContent(getPageContent())), []);

  const handleSave = () => {
    setIsSaving(true);
    updatePageContent(content);
    setTimeout(() => setIsSaving(false), 300);
    alert('Global website content updated successfully!');
  };

  const fields: Array<{ key: keyof typeof content; label: string; textarea?: boolean }> = [
    { key: 'heroTitle', label: 'Homepage Hero Title' },
    { key: 'heroDescription', label: 'Homepage Hero Description', textarea: true },
    { key: 'homeWhoWeAreTitle', label: 'Homepage Section Title' },
    { key: 'homeWhoWeAreText', label: 'Homepage About Text', textarea: true },
    { key: 'homeVisionTitle', label: 'Homepage Vision Title' },
    { key: 'homeVisionText', label: 'Homepage Vision Text', textarea: true },
    { key: 'aboutMission', label: 'About Mission', textarea: true },
    { key: 'aboutVision', label: 'About Vision', textarea: true },
    { key: 'aboutStory', label: 'About Story', textarea: true },
    { key: 'contactHeroTitle', label: 'Contact Hero Title' },
    { key: 'contactHeroDescription', label: 'Contact Hero Description', textarea: true },
    { key: 'contactIntro', label: 'Contact Intro', textarea: true },
    { key: 'volunteerHeroTitle', label: 'Volunteer Hero Title' },
    { key: 'volunteerHeroDescription', label: 'Volunteer Hero Description', textarea: true },
    { key: 'volunteerIntro', label: 'Volunteer Intro', textarea: true },
    { key: 'donateHeroTitle', label: 'Donate Hero Title' },
    { key: 'donateHeroDescription', label: 'Donate Hero Description', textarea: true },
    { key: 'transparencyLockMessage', label: 'Transparency Lock Message', textarea: true },
    { key: 'footerDescription', label: 'Footer Description', textarea: true },
    { key: 'footerEmail', label: 'Footer Email' },
    { key: 'footerPhone', label: 'Footer Phone' },
    { key: 'footerAddress', label: 'Footer Address', textarea: true },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Content CMS</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Control public pages, hero content and footer text</p></div>
        <button onClick={handleSave} disabled={isSaving} className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl disabled:opacity-50">{isSaving ? 'Saving...' : 'Publish Changes'}</button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {fields.map(field => (
          <div key={field.key} className="bg-white p-6 rounded-[2rem] border border-slate-200">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{field.label}</label>
            {field.textarea ? (
              <textarea rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" value={(content as any)[field.key] || ''} onChange={e => setContent({ ...content, [field.key]: e.target.value } as any)} />
            ) : (
              <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" value={(content as any)[field.key] || ''} onChange={e => setContent({ ...content, [field.key]: e.target.value } as any)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManager;
