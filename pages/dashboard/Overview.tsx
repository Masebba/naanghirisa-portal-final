import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { summarizeImpact } from '../../services/geminiService';
import { getCampaigns, getDonations, getPrograms, getVolunteers, updateTaskProgress } from '../../services/mockData';
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

  const myDonations = useMemo(() => donations.filter(donation => donation.donorName === user?.name), [donations, user]);
  const myTotalGiving = myDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'Active').length;
  const myVolunteerProfile = useMemo(() => volunteers.find(volunteer => volunteer.email === user?.email), [volunteers, user]);
  const myTasks = myVolunteerProfile?.tasks || [];
  const completedTasks = myTasks.filter(task => task.status === 'Completed').length;

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
        { label: 'Programs', value: programs.length.toString(), icon: 'fa-heart-pulse', color: 'from-blue-500 to-blue-600' },
        { label: 'Active campaigns', value: activeCampaigns.toString(), icon: 'fa-bullhorn', color: 'from-emerald-500 to-emerald-600' },
        { label: 'Team members', value: volunteers.length.toString(), icon: 'fa-users', color: 'from-slate-700 to-slate-800' },
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
          { label: 'Programs', value: programs.length.toString(), icon: 'fa-briefcase', color: 'from-blue-500 to-blue-600' },
          { label: 'Recognition', value: myVolunteerProfile?.documents?.length ? `${myVolunteerProfile.documents.length}` : '0', icon: 'fa-certificate', color: 'from-slate-700 to-slate-800' },
        ];

  const rowItems = user?.role === UserRole.VOLUNTEER
    ? myTasks
    : (isAdmin ? donations : myDonations).slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200/50 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 md:p-10">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                {isVolunteer ? 'Volunteer tasks' : isDonor ? 'Giving record' : 'Operational log'}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[500px] w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-widest text-slate-400">{isVolunteer ? 'Task' : isAdmin ? 'Source' : 'Entry'}</th>
                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-widest text-slate-400">Update</th>
                    <th className="px-6 py-4 text-right text-[8px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user?.role === UserRole.VOLUNTEER ? (
                    myTasks.length > 0 ? myTasks.map((task: VolunteerTask) => (
                      <tr key={task.id} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold uppercase text-slate-900">{task.title}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <input type="range" min="0" max="100" value={task.progress} onChange={(e) => handleTaskUpdate(task.id, parseInt(e.target.value))} className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-orange-600" />
                            <span className="text-[10px] font-black text-orange-600">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className={`rounded-md border px-2 py-1 text-[8px] font-black uppercase ${task.status === 'Completed' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-orange-100 bg-orange-50 text-orange-600'}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-400">No volunteer tasks assigned yet.</td></tr>
                    )
                  ) : rowItems.length > 0 ? (
                    rowItems.map((item: any) => (
                      <tr key={item.id} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-slate-900">{isAdmin ? item.donorName : item.campaignId || item.category || item.title}</p>
                        </td>
                        <td className="px-6 py-5 text-xs font-black text-emerald-600">{isAdmin ? `$${item.amount.toLocaleString()}` : item.date || 'Pending'}</td>
                        <td className="px-6 py-5 text-right">
                          <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase text-emerald-600">Verified</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-400">No records available yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isAdmin && (
            <div className="group relative flex flex-col overflow-hidden rounded-lg bg-slate-900 p-5 text-white shadow-xl">
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-orange-500 shadow-inner"><i className="fas fa-microchip" /></div>
                  <h3 className="text-base font-black uppercase tracking-tight">Impact summary</h3>
                </div>
                {summary && <div className="mb-6 max-h-[180px] overflow-y-auto rounded-lg border border-white/5 bg-white/5 p-4 text-[10px] italic leading-relaxed text-slate-300">{summary}</div>}
                <button onClick={handleGenerateSummary} disabled={isGenerating} className="w-full rounded-lg bg-orange-600 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-orange-700">
                  {isGenerating ? 'Running…' : 'Generate summary'}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <h4 className="mb-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Quick links</h4>
            <div className="grid gap-3">
              <button onClick={() => navigate('/dashboard/accountability', { state: { openRequest: true } })} className="flex w-full items-center justify-between rounded-lg bg-orange-600 px-5 py-4 text-left text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-100 transition hover:bg-orange-700">
                Make request <i className="fas fa-plus" />
              </button>
              <button onClick={() => navigate('/dashboard/transparency')} className="flex w-full items-center justify-between rounded-lg bg-slate-900 px-5 py-4 text-left text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-black">
                Audit logs <i className="fas fa-file-invoice" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="flex items-center gap-4 rounded-lg border border-slate-200/50 bg-white p-6 shadow-sm transition hover:shadow-lg">
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-lg text-white shadow-lg`}><i className={`fas ${icon}`} /></div>
    <div>
      <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-xl font-black tracking-tighter text-slate-900 md:text-2xl">{value}</p>
    </div>
  </div>
);

export default Overview;
