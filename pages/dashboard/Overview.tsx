
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { summarizeImpact } from '../../services/geminiService';
import { mockPrograms, getDonations, getVolunteers, updateTaskProgress } from '../../services/mockData';
import { authService } from '../../services/authService';
import { UserRole, VolunteerTask } from '../../types';

const Overview: React.FC = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const allDonations = getDonations();
  const myDonations = useMemo(() => allDonations.filter(d => d.donorName === user?.name), [allDonations, user]);
  const totalDonations = allDonations.reduce((acc, curr) => acc + curr.amount, 0);
  const myTotalGiving = myDonations.reduce((acc, curr) => acc + curr.amount, 0);

  const volunteers = getVolunteers();
  const myVolunteerProfile = useMemo(() => volunteers.find(v => v.email === user?.email), [volunteers, user]);
  const myTasks = myVolunteerProfile?.tasks || [];

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    const summary = await summarizeImpact(JSON.stringify(mockPrograms));
    setAiSummary(summary || "No summary available.");
    setIsGenerating(false);
  };

  const handleTaskUpdate = (taskId: string, progress: number) => {
    if (user && myVolunteerProfile) {
      updateTaskProgress(myVolunteerProfile.id, taskId, progress);
      // We perform a soft update here normally, but since we are simulating persistence
      // we'll just trigger a re-render or let the user refresh
    }
  };

  const isFullAdmin = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN].includes(user?.role as UserRole);
  const isStaff = user?.role === UserRole.STAFF_ADMIN;
  const isAnyAdmin = isFullAdmin || isStaff;

  return (
    <div className="space-y-4 md:space-y-6 ">
      {/* Dynamic Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 ">
        {isAnyAdmin ? (
          <>
            <StatCard label="Gross Giving" value={`$${totalDonations.toLocaleString()}`} icon="fa-wallet" color="from-emerald-500 to-emerald-600" />
            <StatCard label="Active Programs" value="4" icon="fa-heart-pulse" color="from-blue-500 to-blue-600" />
            <StatCard label="Directives" value="5" icon="fa-clock-rotate-left" color="from-orange-500 to-orange-600" />
            <StatCard label="Team Size" value={volunteers.length.toString()} icon="fa-users" color="from-red-700 to-red-800" />
          </>
        ) : user?.role === UserRole.DONOR ? (
          <>
            <StatCard label="My Giving" value={`$${myTotalGiving.toLocaleString()}`} icon="fa-heart" color="from-pink-500 to-rose-600" />
            <StatCard label="Impacted" value="12" icon="fa-child-reaching" color="from-blue-500 to-indigo-600" />
            <StatCard label="Status" value="Active" icon="fa-user-check" color="from-orange-500 to-amber-600" />
            <StatCard label="Tier" value="Gold" icon="fa-award" color="from-yellow-500 to-orange-600" />
          </>
        ) : (
          <>
            <StatCard label="Missions" value={myTasks.length.toString()} icon="fa-list-check" color="from-blue-500 to-blue-600" />
            <StatCard label="Field Hours" value="24" icon="fa-hourglass-half" color="from-emerald-500 to-emerald-600" />
            <StatCard label="Points" value="450" icon="fa-certificate" color="from-orange-500 to-orange-600" />
            <StatCard label="Personnel" value="Verified" icon="fa-user-check" color="from-slate-700 to-slate-800" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200/50 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 md:p-10 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                {isAnyAdmin ? 'Operational Log' : user?.role === UserRole.DONOR ? 'Giving Record' : 'Current Directives'}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px] ">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 md:px-10 py-4 font-black text-slate-400 text-[8px] uppercase tracking-widest">{isAnyAdmin ? 'Entity' : 'Detail'}</th>
                    <th className="px-6 md:px-10 py-4 font-black text-slate-400 text-[8px] uppercase tracking-widest">Update</th>
                    <th className="px-6 md:px-10 py-4 font-black text-slate-400 text-[8px] uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user?.role === UserRole.VOLUNTEER ? (
                    myTasks.map((t: VolunteerTask) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 md:px-10 py-5">
                          <p className="font-bold text-slate-900 text-xs uppercase">{t.title}</p>
                        </td>
                        <td className="px-6 md:px-10 py-5">
                          <div className="flex items-center gap-3">
                            <input type="range" min="0" max="100" value={t.progress} onChange={(e) => handleTaskUpdate(t.id, parseInt(e.target.value))} className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                            <span className="text-[10px] font-black text-orange-600">{t.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-10 py-5 text-right">
                          <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-md border ${t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{t.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    (isAnyAdmin ? allDonations : user?.role === UserRole.DONOR ? myDonations : []).slice(0, 5).map((d: any) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 md:px-10 py-5">
                          <p className="font-bold text-slate-900 text-xs">{isAnyAdmin ? d.donorName : d.campaignId}</p>
                        </td>
                        <td className="px-6 md:px-10 py-5 font-black text-emerald-600 text-xs">${d.amount.toLocaleString()}</td>
                        <td className="px-6 md:px-10 py-5 text-right">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-md border border-emerald-100">Verified</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isAnyAdmin && (
            <div className="bg-slate-900 rounded-lg p-4 text-white relative overflow-hidden flex flex-col group shadow-xl">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 border border-white/10 shadow-inner"><i className="fas fa-microchip"></i></div>
                  <h3 className="text-base font-black uppercase tracking-tight">Impact AI</h3>
                </div>
                {aiSummary && <div className="bg-white/5 p-4 rounded-lg text-[10px] leading-relaxed mb-6 border border-white/5 text-slate-300 italic max-h-[150px] overflow-y-auto">"{aiSummary}"</div>}
                <button onClick={handleGenerateSummary} disabled={isGenerating} className="w-full py-4 bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all">
                  {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : 'Run Analysis'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-lg">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Quick Links</h4>
            <div className="grid gap-3">
              <button
                onClick={() => navigate('/dashboard/accountability', { state: { openRequest: true } })}
                className="w-full py-4 px-6 bg-orange-600 text-white font-black text-[9px] uppercase tracking-widest rounded-lg text-left flex items-center justify-between hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100"
              >
                Make Request <i className="fas fa-plus"></i>
              </button>
              <button
                onClick={() => navigate('/dashboard/transparency')}
                className="w-full py-4 px-6 bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest rounded-lg text-left flex items-center justify-between hover:bg-black transition-colors"
              >
                Audit Logs <i className="fas fa-file-invoice"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200/50 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all">
    <div className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-lg text-white shadow-lg`}><i className={`fas ${icon}`}></i></div>
    <div>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  </div>
);

export default Overview;
