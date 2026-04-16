
import React, { useState, useMemo } from 'react';
import { getPageContent, updatePageContent, getExpenditures, getDonations, getOtherIncome } from '../../services/mockData';
import { COLORS } from '../../constants';
import { notify } from '../../services/notifications';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

const TransparencyManager: React.FC = () => {
  const user = authService.getCurrentUser();
  const isManagement = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN].includes(user?.role as UserRole);
  const isDonor = user?.role === UserRole.DONOR;

  const [content, setContent] = useState(getPageContent());
  const [isSaving, setIsSaving] = useState(false);
  const [activeAuditTab, setActiveAuditTab] = useState<'Expenditure' | 'Revenue'>('Expenditure');

  const expenditures = useMemo(() => getExpenditures().filter(e => e.status === 'Approved'), []);
  const donations = getDonations();
  const otherIncome = getOtherIncome();
  
  const allRevenue = useMemo(() => [
    ...donations.map(d => ({ ...d, type: 'Donation', title: d.donorName })),
    ...otherIncome.map(oi => ({ ...oi, type: 'Other Income' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [donations, otherIncome]);

  const handleSave = () => {
    setIsSaving(true);
    updatePageContent(content);
    setIsSaving(false);
    notify('Transparency metrics updated!');
  };

  if (isDonor) {
    return (
      <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>Verified Audit Ledger</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Real-time fiscal transparency for our valued supporters</p>
          </div>
          <div className="flex gap-4 no-print">
            <button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black transition-all flex items-center gap-2">
              <i className="fas fa-file-pdf"></i> Export Audit Statement
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Efficiency</p>
              <p className="text-4xl font-black text-emerald-600">{content.programSpendPercentage}%</p>
              <p className="text-[9px] text-slate-400 mt-2 font-medium">Of every dollar goes directly to the field</p>
           </div>
           <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Year Revenue</p>
              <p className="text-4xl font-black text-slate-900">${content.totalFundsRaised.toLocaleString()}</p>
              <p className="text-[9px] text-slate-400 mt-2 font-medium">Verified from all income channels</p>
           </div>
           <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><i className="fas fa-shield-check text-6xl"></i></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Status</p>
              <p className="text-xl font-black text-orange-400 uppercase tracking-tight">Verified & Audited</p>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
           <div className="flex bg-slate-50 border-b border-slate-200 px-10">
              <button 
                onClick={() => setActiveAuditTab('Expenditure')}
                className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeAuditTab === 'Expenditure' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Organisation Expenditures
              </button>
              <button 
                onClick={() => setActiveAuditTab('Revenue')}
                className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeAuditTab === 'Revenue' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Revenue Streams
              </button>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">{activeAuditTab === 'Expenditure' ? 'Allocation Purpose' : 'Income Source'}</th>
                    <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Class</th>
                    <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeAuditTab === 'Expenditure' ? (
                    expenditures.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-6">
                           <p className="font-bold text-slate-900 text-sm">{e.title}</p>
                           <p className="text-[9px] text-slate-400 font-black uppercase mt-1 italic">Approved By: {e.approvedBy || 'Admin'}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded-lg border border-slate-200">{e.category}</span>
                        </td>
                        <td className="px-10 py-6 font-black text-red-600">-${e.amount.toLocaleString()}</td>
                        <td className="px-10 py-6 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{e.date}</td>
                      </tr>
                    ))
                  ) : (
                    allRevenue.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-6">
                           <p className="font-bold text-slate-900 text-sm">{r.title}</p>
                           <p className="text-[9px] text-slate-400 font-black uppercase mt-1 italic">{r.description || 'Verified Revenue'}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border ${r.type === 'Donation' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>{r.type}</span>
                        </td>
                        <td className="px-10 py-6 font-black text-emerald-600">+${r.amount.toLocaleString()}</td>
                        <td className="px-10 py-6 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{r.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  }

  // Management UI for Super/Mid Admins
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Transparency Manager</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage public metrics and donor accountability policies</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
          UPDATE TRANSPARENCY
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Program Spending %</label>
          <div className="relative">
            <input 
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 font-black text-2xl text-emerald-600" 
              value={content.programSpendPercentage}
              onChange={e => setContent({...content, programSpendPercentage: Number(e.target.value)})}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl">%</span>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacted Children Count</label>
          <input 
            type="number"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 font-black text-2xl text-slate-900" 
            value={content.impactChildrenCount}
            onChange={e => setContent({...content, impactChildrenCount: Number(e.target.value)})}
          />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Funds Raised ($)</label>
          <input 
            type="number"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 font-black text-2xl text-slate-900" 
            value={content.totalFundsRaised}
            onChange={e => setContent({...content, totalFundsRaised: Number(e.target.value)})}
          />
        </div>

        <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-lock"></i>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Public Data Policy Message</h3>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Donor Portal Lock Message</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 text-slate-600 font-medium" 
              value={content.transparencyLockMessage}
              onChange={e => setContent({...content, transparencyLockMessage: e.target.value})}
            />
            <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase">This message is displayed to guest users on the Transparency page.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransparencyManager;
