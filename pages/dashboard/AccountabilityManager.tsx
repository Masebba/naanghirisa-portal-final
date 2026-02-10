
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getExpenditures, addExpenditure, updateExpenditure, getDonations, getOtherIncome, addOtherIncome } from '../../services/mockData';
import { Expenditure, UserRole, OtherIncome, Donation } from '../../types';
import { authService } from '../../services/authService';
import { COLORS } from '../../constants';

const AccountabilityManager: React.FC = () => {
  const currentUser = authService.getCurrentUser();
  const location = useLocation();
  const [expenditures, setExpenditures] = useState<Expenditure[]>(getExpenditures());
  const [otherIncome, setOtherIncome] = useState<OtherIncome[]>(getOtherIncome());
  const [activeTab, setActiveTab] = useState<'income' | 'expenditure' | 'reports'>('expenditure');
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newReq, setNewReq] = useState({ title: '', amount: 0, category: 'Education', description: '', receiptImage: '' });
  
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [newIncome, setNewIncome] = useState({ title: '', amount: 0, category: 'Other', description: '', receiptImage: '' });

  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const incomeFileInputRef = useRef<HTMLInputElement>(null);

  // Handle cross-navigation triggers from Overview
  useEffect(() => {
    if (location.state?.openRequest) {
      setShowRequestModal(true);
      // Clear state to avoid reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const donations = getDonations();
  const donationIncome = useMemo(() => donations.reduce((acc, d) => acc + d.amount, 0), [donations]);
  const manuallyAddedIncome = useMemo(() => otherIncome.reduce((acc, oi) => acc + oi.amount, 0), [otherIncome]);
  const grossIncome = donationIncome + manuallyAddedIncome;
  
  const totalExpenditure = useMemo(() => expenditures.filter(e => e.status === 'Approved').reduce((acc, e) => acc + e.amount, 0), [expenditures]);
  const balance = grossIncome - totalExpenditure;

  const isFullAdmin = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN].includes(currentUser?.role as UserRole);
  const isVolunteer = currentUser?.role === UserRole.VOLUNTEER;

  const handleImageUpload = (setter: Function, state: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter({ ...state, receiptImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateRequest = () => {
    if (!newReq.title || newReq.amount <= 0) {
      alert("Please enter valid title and amount.");
      return;
    }
    const req: Expenditure = {
      id: `e${Date.now()}`,
      title: newReq.title,
      amount: newReq.amount,
      category: newReq.category,
      description: newReq.description,
      receiptImage: newReq.receiptImage,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      initiatedBy: currentUser?.name || 'Unknown'
    };
    addExpenditure(req);
    setExpenditures([...getExpenditures()]);
    setShowRequestModal(false);
    setNewReq({ title: '', amount: 0, category: 'Education', description: '', receiptImage: '' });
    alert('Expenditure request initiated and sent for approval.');
  };

  const handleLogIncome = () => {
    if (!isFullAdmin) return;
    if (!newIncome.title || newIncome.amount <= 0) {
      alert("Please enter valid source and amount.");
      return;
    }
    const inc: OtherIncome = {
      id: `oi${Date.now()}`,
      title: newIncome.title,
      amount: newIncome.amount,
      category: newIncome.category,
      description: newIncome.description,
      receiptImage: newIncome.receiptImage,
      date: new Date().toISOString().split('T')[0]
    };
    addOtherIncome(inc);
    setOtherIncome([...getOtherIncome()]);
    setShowIncomeModal(false);
    setNewIncome({ title: '', amount: 0, category: 'Other', description: '', receiptImage: '' });
    alert('Additional income logged successfully.');
  };

  const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    if (!isFullAdmin) return;
    const exp = expenditures.find(e => e.id === id);
    if (exp) {
      const updated = { ...exp, status, approvedBy: currentUser?.name };
      updateExpenditure(updated);
      setExpenditures([...getExpenditures()]);
      alert(`Request ${status === 'Approved' ? 'approved' : 'rejected'}.`);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>
            {isVolunteer ? 'Organisation Transparency' : 'Financial Accountability'}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            {isVolunteer ? 'Verified fiscal reports and community expenditure oversight' : 'Unified Income & Expenditure Ledger'}
          </p>
        </div>
        {!isVolunteer && (
            <div className="flex gap-4">
                {isFullAdmin && (
                    <button 
                    onClick={() => setShowIncomeModal(true)}
                    className="px-6 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-100"
                    >
                    <i className="fas fa-hand-holding-dollar"></i> Add Income
                    </button>
                )}
                <button 
                    onClick={() => setShowRequestModal(true)}
                    className="px-6 py-3 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-100"
                >
                    <i className="fas fa-plus"></i> Initiate Payment
                </button>
            </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 no-print">
        <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col gap-4">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
              <i className="fas fa-vault"></i>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Revenue</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">${grossIncome.toLocaleString()}</p>
           </div>
        </div>
        <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col gap-4">
           <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl">
              <i className="fas fa-file-invoice-dollar"></i>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Expenditure</p>
              <p className="text-3xl font-black text-red-600 tracking-tighter">${totalExpenditure.toLocaleString()}</p>
           </div>
        </div>
        <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/10 blur-3xl"></div>
          <div className="w-12 h-12 bg-white/5 border border-white/10 text-orange-400 rounded-2xl flex items-center justify-center text-xl relative z-10">
             <i className="fas fa-scale-balanced"></i>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Balance</p>
            <p className="text-3xl font-black tracking-tighter text-orange-400">${balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex bg-slate-50 border-b border-slate-200 px-10 no-print">
          {(['expenditure', 'income', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 -mb-px ${
                activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'income' ? 'Revenue Stream' : tab === 'expenditure' ? 'Spending Logs' : 'Audits & Reports'}
            </button>
          ))}
        </div>

        <div className="flex-grow p-0">
          {activeTab === 'expenditure' && (
            <div className="animate-in fade-in duration-300">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Allocation Detail</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Category</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenditures.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <p className="font-bold text-slate-900 text-sm">{e.title}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase mt-1 italic">Source: {e.initiatedBy}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-lg border border-slate-200">{e.category}</span>
                        </td>
                        <td className="px-10 py-6 font-black text-slate-900">${e.amount.toLocaleString()}</td>
                        <td className="px-10 py-6">
                          <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                            e.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            e.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-3">
                             {e.receiptImage && (
                                <button onClick={() => setViewingReceipt(e.receiptImage!)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center">
                                   <i className="fas fa-file-invoice"></i>
                                </button>
                             )}
                             {e.status === 'Pending' && isFullAdmin && (
                                <>
                                  <button onClick={() => handleUpdateStatus(e.id, 'Approved')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all flex items-center justify-center"><i className="fas fa-check"></i></button>
                                  <button onClick={() => handleUpdateStatus(e.id, 'Rejected')} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-all flex items-center justify-center"><i className="fas fa-times"></i></button>
                                </>
                             )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'income' && (
            <div className="animate-in fade-in duration-300">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Revenue Stream</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Channel</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                      <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Proof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...donations.map(d => ({...d, isDonation: true})), ...otherIncome.map(oi => ({...oi, isDonation: false}))]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((inc: any, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-10 py-6">
                              <p className="font-bold text-slate-900 text-sm">{inc.donorName || inc.title}</p>
                              <p className="text-[9px] text-slate-400 font-black uppercase mt-1 italic truncate max-w-[200px]">{inc.description || 'Verified Inflow'}</p>
                           </td>
                           <td className="px-10 py-6">
                              <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border ${inc.isDonation ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                 {inc.isDonation ? 'Donation' : inc.category || 'Other'}
                              </span>
                           </td>
                           <td className="px-10 py-6 font-black text-emerald-600">${inc.amount.toLocaleString()}</td>
                           <td className="px-10 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{inc.date}</td>
                           <td className="px-10 py-6 text-right">
                              {inc.receiptImage && (
                                <button onClick={() => setViewingReceipt(inc.receiptImage)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all ml-auto flex items-center justify-center">
                                   <i className="fas fa-file-invoice"></i>
                                </button>
                              )}
                           </td>
                        </tr>
                      ))
                    }
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-16 text-center animate-in fade-in duration-500">
               <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-3xl text-slate-300">
                  <i className="fas fa-file-pdf"></i>
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Fiscal Audit Statements</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-12">Consolidated annual and quarterly performance documents</p>
               
               <div className="flex flex-wrap justify-center gap-6">
                  <button onClick={() => alert('Compiling Annual Report...')} className="px-10 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center gap-3 shadow-lg">
                     <i className="fas fa-download"></i> 2024 Audit Statement
                  </button>
                  <button onClick={() => alert('Generating Q1 Statement...')} className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm">
                     <i className="fas fa-file-contract"></i> Q1 Operational Audit
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}

      {/* Initiate Payment Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 md:p-14 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Initiate Payment Request</h3>
                 <button onClick={() => setShowRequestModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"><i className="fas fa-times"></i></button>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Purpose of Expenditure</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-orange-500" value={newReq.title} onChange={e => setNewReq({...newReq, title: e.target.value})} placeholder="e.g. Scholastic Materials for Butaleja Primary" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount ($)</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-orange-500" value={newReq.amount || ''} onChange={e => setNewReq({...newReq, amount: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-orange-500" value={newReq.category} onChange={e => setNewReq({...newReq, category: e.target.value})}>
                            <option>Education</option>
                            <option>Health</option>
                            <option>Welfare</option>
                            <option>Operations</option>
                            <option>Emergency</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Justification / Details</label>
                    <textarea rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500" value={newReq.description} onChange={e => setNewReq({...newReq, description: e.target.value})} placeholder="Why is this payment required?" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attach Requisition / Quote</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-all"
                    >
                       {newReq.receiptImage ? <p className="text-[10px] font-black text-emerald-600 uppercase">Document Attached</p> : <><i className="fas fa-cloud-upload-alt text-slate-300 text-2xl mb-2"></i><p className="text-[9px] font-bold text-slate-400 uppercase">Upload File</p></>}
                       <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(setNewReq, newReq, e)} />
                    </div>
                 </div>
                 <button onClick={handleInitiateRequest} className="w-full py-5 bg-orange-600 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-orange-700 shadow-xl transition-all">Submit for Review</button>
              </div>
           </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 md:p-14 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Log External Revenue</h3>
                 <button onClick={() => setShowIncomeModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"><i className="fas fa-times"></i></button>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Source / Entity Name</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500" value={newIncome.title} onChange={e => setNewIncome({...newIncome, title: e.target.value})} placeholder="e.g. Government Grant, Local Partner Contribution" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount In ($)</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500" value={newIncome.amount || ''} onChange={e => setNewIncome({...newIncome, amount: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Income Category</label>
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500" value={newIncome.category} onChange={e => setNewIncome({...newIncome, category: e.target.value})}>
                            <option>Grant</option>
                            <option>Corporate</option>
                            <option>Government</option>
                            <option>Internal</option>
                            <option>Other</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 outline-none" value={newIncome.description} onChange={e => setNewIncome({...newIncome, description: e.target.value})} placeholder="Reference details for this income stream..." />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Proof of Receipt (Image)</label>
                    <div 
                      onClick={() => incomeFileInputRef.current?.click()}
                      className="w-full bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-all"
                    >
                       {newIncome.receiptImage ? <p className="text-[10px] font-black text-emerald-600 uppercase">Proof Attached</p> : <><i className="fas fa-file-invoice-dollar text-slate-300 text-2xl mb-2"></i><p className="text-[9px] font-bold text-slate-400 uppercase">Attach Proof</p></>}
                       <input ref={incomeFileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(setNewIncome, newIncome, e)} />
                    </div>
                 </div>
                 <button onClick={handleLogIncome} className="w-full py-5 bg-emerald-600 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-emerald-700 shadow-xl transition-all">Log Inbound Stream</button>
              </div>
           </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setViewingReceipt(null)}>
           <div className="bg-white max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewingReceipt(null)} className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-all z-10"><i className="fas fa-times"></i></button>
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Audit Trail Attachment</h4>
                 <button onClick={() => window.print()} className="text-[10px] font-black uppercase text-orange-600 px-4 py-2 hover:bg-orange-50 rounded-lg"><i className="fas fa-print mr-2"></i> Print</button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto p-10 bg-slate-200">
                 <img src={viewingReceipt} className="w-full h-auto rounded shadow-2xl border-4 border-white" alt="Verification Receipt" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AccountabilityManager;
