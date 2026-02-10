
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockCampaigns } from '../services/mockData';
import { COLORS } from '../constants';
import { Campaign } from '../types';

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Closed'>('All');
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter(c => filter === 'All' || c.status === filter);
  }, [filter]);

  const displayedCampaigns = filteredCampaigns.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  const handleDonate = (campaignId: string) => {
    navigate(`/donate?campaign=${campaignId}`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="py-24 text-center text-white" style={{ backgroundColor: COLORS.primary }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">Support Our Mission</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
            Your contributions directly fuel our community initiatives. Every dollar makes a difference.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Impact Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 text-center">
           <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
              <p className="text-3xl font-black text-orange-500 mb-1">$45k+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Raised</p>
           </div>
           <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
              <p className="text-3xl font-black text-orange-500 mb-1">250+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Donors</p>
           </div>
           <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
              <p className="text-3xl font-black text-orange-500 mb-1">100%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transparency</p>
           </div>
           <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
              <p className="text-3xl font-black text-orange-500 mb-1">12+</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projects Funded</p>
           </div>
        </div>

        {/* Filter Sub-menu */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {['All', 'Active', 'Closed'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f as any);
                setVisibleCount(6);
              }}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                filter === f 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {f === 'All' ? 'All Campaigns' : `${f} Campaigns`}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {displayedCampaigns.map((camp) => {
            const progress = (camp.amountRaised / camp.targetAmount) * 100;
            const isClosed = camp.status === 'Closed';

            return (
              <div 
                key={camp.id} 
                className={`bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col group transition-all duration-500 ${isClosed ? 'grayscale opacity-75' : 'hover:shadow-2xl'}`}
              >
                <div className="relative h-64 overflow-hidden">
                   <img src={camp.image} alt={camp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-4 left-4">
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg ${isClosed ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`}>
                        {camp.status}
                      </span>
                   </div>
                   {isClosed && (
                     <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="text-white font-black text-lg uppercase tracking-widest border-2 border-white px-6 py-2 rounded-full">Completed</span>
                     </div>
                   )}
                </div>

                <div className="p-10 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black mb-3 line-clamp-1" style={{ color: COLORS.primary }}>{camp.name}</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-3 font-medium">
                    {camp.purpose}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                       <span>{Math.round(progress)}% Funded</span>
                       <span>Goal: ${camp.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${isClosed ? 'bg-slate-400' : 'bg-orange-500'}`}
                         style={{ width: `${Math.min(progress, 100)}%` }}
                       ></div>
                    </div>
                    <div className="mt-2 text-right">
                       <span className="text-xs font-black" style={{ color: isClosed ? '#64748b' : COLORS.secondary }}>
                          ${camp.amountRaised.toLocaleString()} Raised
                       </span>
                    </div>
                  </div>

                  <div className="grid gap-3 mt-auto">
                    <Link 
                      to={`/campaigns/${camp.id}`}
                      className="w-full text-center py-4 bg-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
                    >
                      Read More
                    </Link>
                    {!isClosed && (
                      <button 
                        onClick={() => handleDonate(camp.id)}
                        className="w-full py-4 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-orange-100"
                        style={{ backgroundColor: COLORS.secondary }}
                      >
                        Donate to this Campaign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredCampaigns.length && (
          <div className="text-center mb-24">
            <button 
              onClick={handleLoadMore}
              className="px-12 py-4 border-2 font-black text-xs uppercase tracking-widest rounded-full transition-all hover:bg-slate-50"
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}
            >
              Load More Campaigns
            </button>
          </div>
        )}

        {/* Why Support Us Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center py-20 border-t border-slate-100">
           <div>
              <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter" style={{ color: COLORS.primary }}>Your Trust Is Our Legacy</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-10">
                We understand that every donor wants to know where their money goes. At Naanghirisa, transparency isn't just a value; it's our core operational model.
              </p>
              <div className="space-y-6">
                 <div className="flex gap-6">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-sm">
                       <i className="fas fa-shield-alt"></i>
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 mb-1">Secure Transactions</h4>
                       <p className="text-slate-500 text-sm">All donations are processed through SSL-encrypted gateways protecting your financial data.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-sm">
                       <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 mb-1">Direct Program Funding</h4>
                       <p className="text-slate-500 text-sm">We minimize overheads to ensure that at least 92% of your donation reaches the field.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-sm">
                       <i className="fas fa-search-dollar"></i>
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 mb-1">Real-Time Reporting</h4>
                       <p className="text-slate-500 text-sm">Donors get regular updates on the specific campaign progress and impact milestones.</p>
                    </div>
                 </div>
              </div>
           </div>
           <div className="bg-slate-950 rounded-[4rem] p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <i className="fas fa-award text-9xl"></i>
              </div>
              <h3 className="text-3xl font-black mb-8">Recent Support</h3>
              <div className="space-y-4">
                 {[
                   { name: "John Smith", amount: "$500", project: "Back to School" },
                   { name: "Global Giving", amount: "$5,000", project: "Water Initiative" },
                   { name: "Anonymous", amount: "$1,200", project: "Sanitary Health" },
                   { name: "Care Partners", amount: "$300", project: "Food Relief" }
                 ].map((donor, idx) => (
                   <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-black">
                            {donor.name[0]}
                         </div>
                         <span className="text-sm font-bold">{donor.name}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-orange-400 font-black text-sm">{donor.amount}</p>
                         <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{donor.project}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <p className="mt-8 text-xs text-slate-500 font-bold text-center uppercase tracking-widest italic">
                 "Join the list of change-makers today"
              </p>
           </div>
        </div>

        {/* Campaign FAQ */}
        <div className="mt-24 text-center max-w-4xl mx-auto">
           <h2 className="text-3xl font-black mb-12" style={{ color: COLORS.primary }}>Fundraising FAQs</h2>
           <div className="grid gap-4 text-left">
              {[
                { q: "Is my donation tax-deductible?", a: "Yes, Naanghirisa is a registered Community Based Organisation. We provide tax receipts for all contributions." },
                { q: "Can I donate to a specific child?", a: "While general campaigns support cohorts, you can use our Child Sponsorship Program to sponsor an individual student." },
                { q: "What happens if a campaign exceeds its goal?", a: "Surplus funds are allocated to the next most urgent community need within the same category (e.g., education or health)." }
              ].map((faq, idx) => (
                <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                   <h4 className="font-black text-slate-900 mb-2">{faq.q}</h4>
                   <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
