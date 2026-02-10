
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockCampaigns } from '../services/mockData';
import { COLORS } from '../constants';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaign = mockCampaigns.find((c) => c.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!campaign) {
      navigate('/campaigns');
    }
  }, [campaign, navigate]);

  if (!campaign) return null;

  const progress = (campaign.amountRaised / campaign.targetAmount) * 100;
  const isClosed = campaign.status === 'Closed';

  const handleDonate = () => {
    alert(`Initiating donation for ${campaign.name}.`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="relative h-[450px]">
        <img src={campaign.image} alt={campaign.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-center">
          <div className="max-w-4xl px-4">
            <Link to="/campaigns" className="text-white/80 hover:text-white mb-6 inline-block font-bold text-sm uppercase tracking-widest">
              <i className="fas fa-arrow-left mr-2"></i> Back to Campaigns
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">{campaign.name}</h1>
            <div className="flex justify-center gap-4">
              <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider ${isClosed ? 'bg-slate-800 text-slate-300' : 'bg-emerald-600 text-white'}`}>
                Status: {campaign.status}
              </span>
              <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                Goal: ${campaign.targetAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-black mb-6" style={{ color: COLORS.primary }}>About This Campaign</h2>
              <div className="prose prose-lg text-slate-600 max-w-none">
                <p className="mb-6 font-medium text-lg text-slate-800">{campaign.purpose}</p>
                <p className="leading-relaxed whitespace-pre-line">
                  {campaign.description || "Detailed description for this campaign is being compiled by our management team. We appreciate your patience as we ensure all data is accurate and transparent."}
                </p>
              </div>
            </section>

            <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
               <h3 className="text-2xl font-black mb-6" style={{ color: COLORS.primary }}>Project Timeline</h3>
               <div className="flex items-center gap-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</span>
                     <span className="font-bold text-slate-900">{campaign.startDate}</span>
                  </div>
                  <div className="h-0.5 flex-grow bg-slate-200 relative">
                     <div className="absolute inset-0 bg-orange-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <div className="flex flex-col text-right">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">End Date</span>
                     <span className="font-bold text-slate-900">{campaign.endDate}</span>
                  </div>
               </div>
            </section>

            <section className="grid md:grid-cols-2 gap-8">
               <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4">
                     <i className="fas fa-hand-holding-heart"></i>
                  </div>
                  <h4 className="font-black text-xl mb-2" style={{ color: COLORS.primary }}>Why Support?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Your gift provides immediate resources that are often unavailable in local government budgets.</p>
               </div>
               <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">
                     <i className="fas fa-chart-pie"></i>
                  </div>
                  <h4 className="font-black text-xl mb-2" style={{ color: COLORS.primary }}>Allocation</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Funds are managed through a dedicated committee with monthly transparent audits.</p>
               </div>
            </section>
          </div>

          {/* Sidebar / Funding Widget */}
          <div className="space-y-8">
             <div className="p-10 rounded-[3rem] bg-slate-950 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <i className="fas fa-donate text-9xl"></i>
                </div>
                <div className="relative z-10">
                   <h4 className="text-xl font-black mb-8">Funding Progress</h4>
                   
                   <div className="mb-10">
                      <div className="flex justify-between items-end mb-4">
                         <span className="text-3xl font-black text-orange-500">${campaign.amountRaised.toLocaleString()}</span>
                         <span className="text-xs font-bold text-slate-500">of ${campaign.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-orange-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                      </div>
                      <p className="mt-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                         {Math.round(progress)}% of goal reached
                      </p>
                   </div>

                   {!isClosed ? (
                     <div className="space-y-4">
                        <button 
                          onClick={handleDonate}
                          className="w-full py-5 bg-orange-600 text-white font-black rounded-[1.5rem] hover:bg-orange-700 transition-all shadow-xl shadow-orange-950"
                        >
                           DONATE NOW
                        </button>
                        <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                           Secure Payment via SSL
                        </p>
                     </div>
                   ) : (
                     <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                        <p className="text-sm font-bold text-slate-400">This campaign is now completed. Thank you for your support!</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="p-10 rounded-[3rem] border border-slate-100 bg-slate-50">
                <h4 className="font-black text-slate-900 mb-6">Spread the word</h4>
                <div className="flex gap-4">
                   {['facebook-f', 'twitter', 'whatsapp'].map(icon => (
                     <button key={icon} className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-500 transition-all">
                        <i className={`fab fa-${icon}`}></i>
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
