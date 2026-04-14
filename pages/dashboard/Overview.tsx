import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { summarizeImpact } from '../../services/geminiService';
import { getCampaigns, getDonations, getFeedback, getPageContent, getPrograms, getVolunteers, updateTaskProgress } from '../../services/mockData';
import { authService } from '../../services/authService';
import { UserRole, VolunteerTask } from '../../types';

const Overview: React.FC = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const programs = getPrograms();
  const campaigns = getCampaigns();
  const donations = getDonations();
  const volunteers = getVolunteers();
  const feedback = getFeedback();
  const content = getPageContent();

  const myDonations = useMemo(() => donations.filter(donation => donation.donorName === user?.name), [donations, user]);
  const myTotalGiving = myDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'Active').length;
  const myVolunteerProfile = useMemo(() => volunteers.find(volunteer => volunteer.email === user?.email), [volunteers, user]);
  const myTasks = myVolunteerProfile?.tasks || [];
  const completedTasks = myTasks.filter(task => task.status === 'Completed').length;
  const taskProgress = myTasks.length ? Math.round(myTasks.reduce((sum, task) => sum + task.progress, 0) / myTasks.length) : 0;

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    const result = await summarizeImpact(JSON.stringify(programs));
    setSummary(result);
    setIsGenerating(false);
  };

  const handleTaskUpdate = (taskId: string, progress: number) => {
    if (user && myVolunteerProfile) {
      updateTaskProgress(myVolunteerProfile.id, taskId, progress);
      setSummary('Task progress updated. Refresh the dashboard to see the latest status.');
    }
  };

  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user?.role as UserRole);
  const isDonor = user?.role === UserRole.DONOR;
  const isVolunteer = user?.role === UserRole.VOLUNTEER;

  const cards = isAdmin
    ? [
        { label: 'Gross giving', value: `$${totalDonations.toLocaleString()}`, icon: 'fa-wallet', color: 'from-orange-500 to-orange-600' },
        { label: 'Programs live', value: programs.length.toString(), icon: 'fa-heart-pulse', color: 'from-blue-500 to-blue-600' },
        { label: 'Active campaigns', value: activeCampaigns.toString(), icon: 'fa-bullhorn', color: 'from-emerald-500 to-emerald-600' },
        { label: 'Volunteers', value: volunteers.length.toString(), icon: 'fa-users', color: 'from-slate-700 to-slate-800' },
      ]
    : isDonor
      ? [
          { label: 'My giving', value: `$${myTotalGiving.toLocaleString()}`, icon: 'fa-heart', color: 'from-orange-500 to-orange-600' },
          { label: 'My donations', value: myDonations.length.toString(), icon: 'fa-receipt', color: 'from-blue-500 to-blue-600' },
          { label: 'Supported children', value: Math.floor(myTotalGiving / 250).toString(), icon: 'fa-child-reaching', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Portal status', value: 'Active', icon: 'fa-user-check', color: 'from-slate-700 to-slate-800' },
        ]
      : [
          { label: 'Missions', value: myTasks.length.toString(), icon: 'fa-list-check', color: 'from-orange-500 to-orange-600' },
          { label: 'Completed', value: completedTasks.toString(), icon: 'fa-circle-check', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Average progress', value: `${taskProgress}%`, icon: 'fa-chart-line', color: 'from-blue-500 to-blue-600' },
          { label: 'Recognition', value: myVolunteerProfile?.documents?.length ? `${myVolunteerProfile.documents.length}` : '0', icon: 'fa-certificate', color: 'from-slate-700 to-slate-800' },
        ];

  const rowItems = user?.role === UserRole.VOLUNTEER
    ? myTasks
    : (isAdmin ? donations : myDonations).slice(0, 5);

  const contentScore = [
    content.homeHeroImage,
    content.aboutHeaderImage,
    content.aboutFormationImage,
    content.contactHeroImage,
    content.volunteerHeroImage,
    content.donateHeroImage,
    content.programsHeroImage,
    content.campaignsHeroImage,
    content.newsHeroImage,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200/70 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900">{isVolunteer ? 'Volunteer tasks' : isDonor ? 'Giving record' : 'Operational log'}</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Live status from the portal database</p>
              </div>
              {isVolunteer && (
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Average progress {taskProgress}%
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[500px] w-full text-left">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400">{isVolunteer ? 'Task' : isAdmin ? 'Source' : 'Entry'}</th>
                    <th className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400">Update</th>
                    <th className="px-4 py-3 text-right text-[8px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user?.role === UserRole.VOLUNTEER ? (
                    myTasks.length > 0 ? myTasks.map((task: VolunteerTask) => (
                      <tr key={task.id} className="transition hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <p className="text-xs font-bold uppercase text-slate-900">{task.title}</p>
                          <p className="text-[10px] text-slate-400">{task.description || 'Assigned mission'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <input type="range" min="0" max="100" value={task.progress} onChange={(e) => handleTaskUpdate(task.id, parseInt(e.target.value))} className="h-1 w-28 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-orange-600" />
                            <span className="text-[10px] font-black text-orange-600">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase ${task.status === 'Completed' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-orange-100 bg-orange-50 text-orange-600'}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">No volunteer tasks assigned yet.</td></tr>
                    )
                  ) : rowItems.length > 0 ? (
                    rowItems.map((item: any) => (
                      <tr key={item.id} className="transition hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <p className="text-xs font-bold text-slate-900">{isAdmin ? item.donorName : item.campaignId || item.category || item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.description || item.date || 'Pending'}</p>
                        </td>
                        <td className="px-4 py-4 text-xs font-black text-emerald-600">{isAdmin ? `$${item.amount.toLocaleString()}` : item.date || 'Pending'}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase text-emerald-600">Verified</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">No records available yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MiniPanel title="Feedback" value={feedback.length.toString()} hint={`${feedback.filter(item => (item.status || 'New') === 'New').length} new messages`} icon="fa-comment-dots" />
            <MiniPanel title="Content blocks" value={contentScore.toString()} hint="Live images synced" icon="fa-photo-film" />
            <MiniPanel title="Campaigns" value={campaigns.length.toString()} hint={`${activeCampaigns} active campaigns`} icon="fa-bullhorn" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-orange-500 shadow-inner"><i className="fas fa-microchip" /></div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Impact summary</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI-assisted snapshot for admin planning</p>
              </div>
            </div>
            {summary && <div className="mb-4 max-h-[160px] overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3 text-[10px] italic leading-relaxed text-slate-600">{summary}</div>}
            <button onClick={handleGenerateSummary} disabled={isGenerating} className="w-full rounded-lg bg-orange-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-orange-700">
              {isGenerating ? 'Running…' : 'Generate summary'}
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quick links</h4>
            <div className="grid gap-2">
              <button onClick={() => navigate('/dashboard/accountability', { state: { openRequest: true } })} className="flex w-full items-center justify-between rounded-lg bg-orange-600 px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white shadow-sm transition hover:bg-orange-700">
                Make request <i className="fas fa-plus" />
              </button>
              <button onClick={() => navigate('/dashboard/transparency')} className="flex w-full items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-black">
                Audit logs <i className="fas fa-file-invoice" />
              </button>
              <button onClick={() => navigate('/dashboard/content')} className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-200">
                Manage content <i className="fas fa-pen-to-square" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-base text-white shadow-md`}><i className={`fas ${icon}`} /></div>
    <div>
      <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-lg font-black tracking-tighter text-slate-900 md:text-xl">{value}</p>
    </div>
  </div>
);

const MiniPanel: React.FC<{ title: string; value: string; hint: string; icon: string }> = ({ title, value, hint, icon }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500"><i className={`fas ${icon}`} /></div>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{hint}</p>
  </div>
);

export default Overview;
