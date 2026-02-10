
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getDonations, mockStudents, getExpenditures, getPageContent } from '../services/mockData';
import { authService } from '../services/authService';
// Added COLORS import to fix the error on line 148 where COLORS.primary is used
import { COLORS } from '../constants';

const Transparency: React.FC = () => {
  const isLoggedIn = authService.isAuthenticated();
  const pageContent = getPageContent();
  const expenditures = getExpenditures().filter(e => e.status === 'Approved');
  const donations = getDonations();

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Accountability & Impact</h1>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">
            At Naanghirisa, transparency is our core value. We track every cent to ensure maximum community benefit.
          </p>
        </div>

        {/* Financial Overview - Public Part */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="text-emerald-600 text-4xl mb-4"><i className="fas fa-hand-holding-dollar"></i></div>
             <div className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">{pageContent.programSpendPercentage}%</div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Of donations reach program goals</div>
          </div>
          <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="text-blue-600 text-4xl mb-4"><i className="fas fa-child"></i></div>
             <div className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">{pageContent.impactChildrenCount}+</div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Children directly supported</div>
          </div>
          <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="text-amber-600 text-4xl mb-4"><i className="fas fa-file-invoice-dollar"></i></div>
             <div className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">${pageContent.totalFundsRaised.toLocaleString()}</div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raised for current fiscal year</div>
          </div>
        </div>

        {/* Accountability Data - Donor Locked */}
        {!isLoggedIn ? (
          <div className="relative">
             <div className="filter blur-md pointer-events-none space-y-12">
                <div className="h-64 bg-slate-100 rounded-[3rem]"></div>
                <div className="h-64 bg-slate-100 rounded-[3rem]"></div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 text-center max-w-md animate-in zoom-in-95 duration-500">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <i className="fas fa-lock text-3xl"></i>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Donor Access Required</h3>
                   <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                     {pageContent.transparencyLockMessage}
                   </p>
                   <Link to="/login" className="block w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 mb-4 transition-all shadow-xl shadow-emerald-100 uppercase text-[10px] tracking-widest">
                      Log In to Audit Data
                   </Link>
                   <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Join our movement. Donate to gain full access.</p>
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in duration-700">
            <section>
               <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Expenditure Audit</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Financial Tracking</p>
               </div>
               <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                           <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                           <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Allocation</th>
                           <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                           <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {expenditures.map(e => (
                          <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6 text-sm font-bold text-slate-500">{e.date}</td>
                            <td className="px-10 py-6 font-black text-slate-900 uppercase text-xs">{e.title}</td>
                            <td className="px-10 py-6">
                               <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-lg border border-slate-200">{e.category}</span>
                            </td>
                            <td className="px-10 py-6 text-right font-black text-red-600">-${e.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Sponsored Students</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Impact Verification</p>
               </div>
              <div className="grid md:grid-cols-2 gap-8">
                {mockStudents.map(s => (
                  <div key={s.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="font-black text-slate-900 text-xl tracking-tighter">{s.name}</h4>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.age} Years Old</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium italic">"{s.background}"</p>
                    <span className="inline-block px-4 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section>
               <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Recent Income</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor Contributions</p>
               </div>
               <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                           <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Donor</th>
                           <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                           <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Contribution</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {donations.slice(0, 5).map(d => (
                          <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6 font-black text-slate-900 uppercase text-xs">{d.donorName}</td>
                            <td className="px-10 py-6 text-sm font-bold text-slate-500">{d.date}</td>
                            <td className="px-10 py-6 text-right font-black text-emerald-600">+${d.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
          </div>
        )}

        <div className="mt-24 text-center">
           <h3 className="text-2xl font-black mb-10 uppercase tracking-tighter" style={{ color: COLORS.primary }}>Archived Accountability Reports</h3>
           <div className="flex flex-wrap justify-center gap-6">
              {[2023, 2022, 2021].map(year => (
                <button key={year} className="flex items-center gap-4 px-10 py-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm group">
                   <i className="far fa-file-pdf text-red-500 text-xl transition-transform group-hover:scale-125"></i>
                   <span className="font-black text-[10px] uppercase tracking-widest text-slate-700">{year} Audit Statement</span>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Transparency;
