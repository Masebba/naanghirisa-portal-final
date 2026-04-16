import React, { useEffect, useMemo, useState } from 'react';
import { COLORS } from '../../constants';
import { notify } from '../../services/notifications';
import { downloadJson } from '../../services/fileExport';
import { getPageContent, subscribeStoreUpdates, updatePageContent, type PageContent } from '../../services/mockData';

type FieldKind = 'text' | 'textarea' | 'number' | 'image';

type FieldDef = {
  key: keyof PageContent;
  label: string;
  kind: FieldKind;
  placeholder?: string;
};

type TabDef = {
  id: string;
  label: string;
  description: string;
  fields: FieldDef[];
};

const tabs: TabDef[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Site-wide identity, footer and transparency counters.',
    fields: [
      { key: 'heroTitle', label: 'Default Hero Title', kind: 'text' },
      { key: 'heroDescription', label: 'Default Hero Description', kind: 'textarea' },
      { key: 'footerDescription', label: 'Footer Description', kind: 'textarea' },
      { key: 'footerEmail', label: 'Footer Email', kind: 'text' },
      { key: 'footerPhone', label: 'Footer Phone', kind: 'text' },
      { key: 'footerAddress', label: 'Footer Address', kind: 'textarea' },
      { key: 'programSpendPercentage', label: 'Program Spend %', kind: 'number' },
      { key: 'impactChildrenCount', label: 'Children Impacted', kind: 'number' },
      { key: 'totalFundsRaised', label: 'Total Funds Raised', kind: 'number' },
    ],
  },
  {
    id: 'home',
    label: 'Home',
    description: 'Hero copy, What We Do section and home visuals.',
    fields: [
      { key: 'homeHeroTitle', label: 'Home Hero Title', kind: 'text' },
      { key: 'homeHeroDescription', label: 'Home Hero Description', kind: 'textarea' },
      { key: 'homeWhoWeAreTitle', label: 'Who We Are Title', kind: 'text' },
      { key: 'homeWhoWeAreText', label: 'Who We Are Text', kind: 'textarea' },
      { key: 'homeWhatWeDoTitle', label: 'What We Do Title', kind: 'text' },
      { key: 'homeWhatWeDoText', label: 'What We Do Intro', kind: 'textarea' },
      { key: 'homeVisionTitle', label: 'Vision Title', kind: 'text' },
      { key: 'homeVisionText', label: 'Vision Text', kind: 'textarea' },
      { key: 'homeHeroImage', label: 'Home Hero Background', kind: 'image' },
      { key: 'homeHeroSideImage', label: 'Home Hero Side Image', kind: 'image' },
      { key: 'homeSnapshotImage1', label: 'Home Snapshot Image 1', kind: 'image' },
      { key: 'homeSnapshotImage2', label: 'Home Snapshot Image 2', kind: 'image' },
      { key: 'homeProgramImage1', label: 'What We Do Image 1', kind: 'image' },
      { key: 'homeProgramImage2', label: 'What We Do Image 2', kind: 'image' },
      { key: 'homeProgramImage3', label: 'What We Do Image 3', kind: 'image' },
      { key: 'homeProgramImage4', label: 'What We Do Image 4', kind: 'image' },
      { key: 'homeVisionImage', label: 'Home Vision Image', kind: 'image' },
    ],
  },
  {
    id: 'about',
    label: 'About',
    description: 'About page story, formation and timeline images.',
    fields: [
      { key: 'aboutHeaderTitle', label: 'About Header Title', kind: 'text' },
      { key: 'aboutHeaderSubtitle', label: 'About Header Subtitle', kind: 'textarea' },
      { key: 'aboutMission', label: 'Mission', kind: 'textarea' },
      { key: 'aboutVision', label: 'Vision', kind: 'textarea' },
      { key: 'aboutStory', label: 'Story', kind: 'textarea' },
      { key: 'aboutJoinText', label: 'Join Text', kind: 'textarea' },
      { key: 'aboutPublicDomainTitle', label: 'Public Domain Title', kind: 'text' },
      { key: 'aboutPublicDomainText', label: 'Public Domain Text', kind: 'textarea' },
      { key: 'aboutHeaderImage', label: 'About Header Image', kind: 'image' },
      { key: 'aboutFormationImage', label: 'About Formation Image', kind: 'image' },
      { key: 'aboutJourneyImage', label: 'About Journey Image', kind: 'image' },
      { key: 'aboutFlashback2016', label: 'Timeline Image 2016', kind: 'image' },
      { key: 'aboutFlashback2017', label: 'Timeline Image 2017', kind: 'image' },
      { key: 'aboutFlashback2018', label: 'Timeline Image 2018', kind: 'image' },
      { key: 'aboutFlashback2019', label: 'Timeline Image 2019', kind: 'image' },
      { key: 'aboutFlashback2020', label: 'Timeline Image 2020', kind: 'image' },
      { key: 'aboutFlashback2021', label: 'Timeline Image 2021', kind: 'image' },
      { key: 'aboutFlashback2022', label: 'Timeline Image 2022', kind: 'image' },
      { key: 'aboutFlashback2023', label: 'Timeline Image 2023', kind: 'image' },
      { key: 'aboutFlashback2024', label: 'Timeline Image 2024', kind: 'image' },
      { key: 'aboutFlashback2025', label: 'Timeline Image 2025', kind: 'image' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Contact page copy, channels and hero image.',
    fields: [
      { key: 'contactHeroTitle', label: 'Contact Hero Title', kind: 'text' },
      { key: 'contactHeroDescription', label: 'Contact Hero Description', kind: 'textarea' },
      { key: 'contactIntro', label: 'Contact Intro', kind: 'textarea' },
      { key: 'contactEmailSupport', label: 'Support Email', kind: 'text' },
      { key: 'contactEmailEnquiry', label: 'Enquiry Email', kind: 'text' },
      { key: 'contactPhone1', label: 'Phone 1', kind: 'text' },
      { key: 'contactPhone2', label: 'Phone 2', kind: 'text' },
      { key: 'contactAddress', label: 'Address', kind: 'textarea' },
      { key: 'contactHeroImage', label: 'Contact Hero Image', kind: 'image' },
    ],
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    description: 'Volunteer landing page copy and hero image.',
    fields: [
      { key: 'volunteerHeroTitle', label: 'Volunteer Hero Title', kind: 'text' },
      { key: 'volunteerHeroDescription', label: 'Volunteer Hero Description', kind: 'textarea' },
      { key: 'volunteerIntro', label: 'Volunteer Intro', kind: 'textarea' },
      { key: 'volunteerHeroImage', label: 'Volunteer Hero Image', kind: 'image' },
    ],
  },
  {
    id: 'donate',
    label: 'Donate',
    description: 'Donation page copy and hero image.',
    fields: [
      { key: 'donateHeroTitle', label: 'Donate Hero Title', kind: 'text' },
      { key: 'donateHeroDescription', label: 'Donate Hero Description', kind: 'textarea' },
      { key: 'donateIntro', label: 'Donate Intro', kind: 'textarea' },
      { key: 'donateHeroImage', label: 'Donate Hero Image', kind: 'image' },
    ],
  },
  {
    id: 'listPages',
    label: 'Lists',
    description: 'Programmes, campaigns and news hero images.',
    fields: [
      { key: 'programsHeroImage', label: 'Programs Hero Image', kind: 'image' },
      { key: 'campaignsHeroImage', label: 'Campaigns Hero Image', kind: 'image' },
      { key: 'newsHeroImage', label: 'News Hero Image', kind: 'image' },
    ],
  },
  {
    id: 'transparency',
    label: 'Transparency',
    description: 'Transparency page copy, lock message and hero image.',
    fields: [
      { key: 'transparencyIntro', label: 'Transparency Intro', kind: 'textarea' },
      { key: 'transparencyLockMessage', label: 'Lock Message', kind: 'textarea' },
      { key: 'transparencyArchivesText', label: 'Archives Text', kind: 'textarea' },
      { key: 'transparencyHeroImage', label: 'Transparency Hero Image', kind: 'image' },
    ],
  },
];

const fieldsPerPage = 6;

const ContentManager: React.FC = () => {
  const [content, setContent] = useState<PageContent>(getPageContent());
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [page, setPage] = useState(1);

  useEffect(() => subscribeStoreUpdates(() => setContent(getPageContent())), []);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];
  const totalPages = Math.max(1, Math.ceil(currentTab.fields.length / fieldsPerPage));
  const visibleFields = currentTab.fields.slice((page - 1) * fieldsPerPage, page * fieldsPerPage);

  const handleSave = () => {
    setIsSaving(true);
    updatePageContent(content);
    window.setTimeout(() => setIsSaving(false), 300);
    notify('Website content updated successfully.');
  };

  const updateField = (key: keyof PageContent, value: string | number) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleImagePick = (key: keyof PageContent, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField(key, String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const renderField = (field: FieldDef) => {
    const value = content[field.key];
    return (
      <div key={String(field.key)} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">{field.label}</label>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-300">Syncs to Firestore</p>
          </div>
          {field.kind === 'image' && value ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-600">Image loaded</span>
          ) : null}
        </div>

        {field.kind === 'textarea' ? (
          <textarea
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
            value={String(value || '')}
            onChange={e => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
          />
        ) : field.kind === 'number' ? (
          <input
            type="number"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:border-orange-500"
            value={Number(value || 0)}
            onChange={e => updateField(field.key, Number(e.target.value))}
            placeholder={field.placeholder || field.label}
          />
        ) : field.kind === 'image' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="h-20 w-28 overflow-hidden rounded-xl bg-white shadow-sm">
                {value ? (
                  <img src={String(value)} alt={field.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <i className="fas fa-image text-2xl" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                  value={String(value || '')}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder="Paste an image URL or data URL"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-black">
                  <i className="fas fa-upload" />
                  Upload image
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImagePick(field.key, e)} />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
            value={String(value || '')}
            onChange={e => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Content CMS</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Manage site copy and every public-facing image from Firestore</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => downloadJson('site-content-backup', pageContent)} className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-600 transition hover:bg-slate-50">Backup JSON</button>
          <button onClick={handleSave} disabled={isSaving} className="rounded-2xl bg-orange-600 px-8 py-4 font-black text-white shadow-xl shadow-orange-100 transition hover:bg-orange-700 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-slate-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{currentTab.label}</h3>
            <p className="mt-1 text-sm text-slate-500">{currentTab.description}</p>
          </div>
          <div className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div>{currentTab.fields.length} fields</div>
            <div>Page {page} of {totalPages}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {visibleFields.map(renderField)}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-200 disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`h-10 min-w-10 rounded-full px-3 text-[10px] font-black uppercase tracking-widest transition ${pageNumber === page ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
