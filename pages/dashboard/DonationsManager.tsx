
import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getDonations, getCampaigns, addDonation } from '../../services/mockData';
import { Donation, UserRole, Campaign } from '../../types';
import { COLORS } from '../../constants';
import { downloadJson, downloadCsv } from '../../services/fileExport';
import { notify } from '../../services/notifications';
import { authService } from '../../services/authService';

type PaymentMethod = 'MTN' | 'AIRTEL' | 'CARD';

const DonationsManager: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdminOrStaff = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user?.role as UserRole);
  const isDonorOrVolunteer = [UserRole.DONOR, UserRole.VOLUNTEER].includes(user?.role as UserRole);

  const [donations, setDonations] = useState<Donation[]>(getDonations());
  const [activeTab, setActiveTab] = useState<'Personal' | 'Community'>('Personal');
  
  // Modal States
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDonorDonateModal, setShowDonorDonateModal] = useState(false);
  
  // Donation Flow States
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Amount/Target, 2: Payment Method, 3: Details/Process
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | 'General' | null>(null);
  const [donorAmount, setDonorAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Manual Log State (Admin)
  const [newDonation, setNewDonation] = useState({ donorName: '', amount: 0, category: 'General Fund', campaignId: 'General', description: '', receiptImage: '' });

  const campaigns = getCampaigns();
  const activeCampaigns = useMemo(() => campaigns.filter(c => c.status === 'Active'), [campaigns]);
  const personalDonations = useMemo(() => donations.filter(d => d.donorName === user?.name || (d.donorName === 'Anonymous' && !isAdminOrStaff)), [donations, user, isAdminOrStaff]);
  
  const stats = useMemo(() => {
    const pool = isAdminOrStaff ? donations : personalDonations;
    const campaignTotal = pool.filter(d => d.campaignId !== 'General').reduce((acc, d) => acc + d.amount, 0);
    const generalTotal = pool.filter(d => d.campaignId === 'General').reduce((acc, d) => acc + d.amount, 0);
    return { campaignTotal, generalTotal, grossTotal: campaignTotal + generalTotal };
  }, [donations, personalDonations, isAdminOrStaff]);

  const resetFlow = () => {
    setShowDonorDonateModal(false);
    setStep(1);
    setSelectedCampaign(null);
    setDonorAmount(0);
    setPaymentMethod(null);
    setPhoneNumber('');
    setIsProcessing(false);
    setPaymentSuccess(false);
    setProcessStatus('');
  };

  const handleManualLog = () => {
    if (!newDonation.donorName || newDonation.amount <= 0) {
      notify("Please enter a valid donor name and amount.");
      return;
    }
    const log: Donation = {
      id: `d${Date.now()}`,
      donorName: newDonation.donorName,
      amount: newDonation.amount,
      category: newDonation.category,
      campaignId: newDonation.campaignId,
      description: newDonation.description,
      receiptImage: newDonation.receiptImage,
      date: new Date().toISOString().split('T')[0]
    };
    addDonation(log);
    setDonations([...getDonations()]);
    setShowLogModal(false);
    setNewDonation({ donorName: '', amount: 0, category: 'General Fund', campaignId: 'General', description: '', receiptImage: '' });
  };

  const handleProcessPayment = () => {
    if ((paymentMethod === 'MTN' || paymentMethod === 'AIRTEL') && phoneNumber.length < 10) {
      notify('Please enter a valid Ugandan phone number (e.g., 077... or 070...)');
      return;
    }

    const campaignId = selectedCampaign === 'General' ? 'General' : (selectedCampaign as Campaign).id;
    const campaignName = selectedCampaign === 'General' ? 'General Welfare' : (selectedCampaign as Campaign).name;

    setIsProcessing(true);
    setProcessStatus(`Recording ${paymentMethod || 'CARD'} contribution...`);

    const log: Donation = {
      id: `d${Date.now()}`,
      donorName: user?.name || 'Anonymous Donor',
      amount: donorAmount,
      category: selectedCampaign === 'General' ? 'General Fund' : 'Campaign Support',
      campaignId,
      description: `Contribution logged for ${campaignName}${phoneNumber ? ` from ${phoneNumber}` : ''}`,
      date: new Date().toISOString().split('T')[0],
      receiptImage: undefined,
    };

    addDonation(log);
    setDonations([...getDonations()]);
    setIsProcessing(false);
    setProcessStatus('Contribution recorded successfully.');
    setPaymentSuccess(true);
  };

  const anonymize = (name: string) => {
    if (isAdminOrStaff) return name;
    if (name === user?.name) return name + " (You)";
    const parts = name.split(' ');
    if (parts.length < 2) return "Global Supporter";
    return `${parts[0][0]}. ${parts[1][0]}.`;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>
             {isAdminOrStaff ? 'Contribution Ledger' : 'Member Giving Hub'}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
             {isAdminOrStaff ? 'Audit and record organisation contributions' : 'Your personal track record of community support'}
          </p>
        </div>
        <div className="flex gap-4">
            <button onClick={() => downloadJson('donations-backup', donations)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest">Backup JSON</button>
            <button onClick={() => downloadCsv('donations-backup', donations.map(d => ({ id: d.id, donorName: d.donorName, amount: d.amount, date: d.date, campaignId: d.campaignId || '', category: d.category || '', description: d.description || '' })))} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest">Export CSV</button>
            {isAdminOrStaff && (
            <button onClick={() => setShowLogModal(true)} className="px-6 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center gap-2">
                <i className="fas fa-plus"></i> Manual Log
            </button>
            )}
            {isDonorOrVolunteer && (
            <button 
                onClick={() => setShowDonorDonateModal(true)} 
                className="px-6 py-3 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center gap-2"
            >
                <i className="fas fa-heart"></i> Make a Donation
            </button>
            )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-8">
         <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Campaign Contributions</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">${stats.campaignTotal.toLocaleString()}</p>
         </div>
         <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">General Fund Support</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">${stats.generalTotal.toLocaleString()}</p>
         </div>
         <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/10 blur-3xl"></div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Lifetime Impact</p>
               <p className="text-3xl font-black tracking-tighter text-orange-400">${stats.grossTotal.toLocaleString()}</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="flex bg-slate-50 border-b border-slate-100 px-10">
          <button onClick={() => setActiveTab('Personal')} className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'Personal' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400'}`}>
            My Contributions
          </button>
          <button onClick={() => setActiveTab('Community')} className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'Community' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400'}`}>
            Wall of Supporters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Contributor</th>
                <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Project</th>
                <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'Personal' ? personalDonations : donations).map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <p className="font-bold text-slate-900">{anonymize(d.donorName)}</p>
                  </td>
                  <td className="px-10 py-6">
                     <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100">
                        {d.campaignId === 'General' ? 'Global Welfare' : campaigns.find(c => c.id === d.campaignId)?.name || 'Campaign'}
                     </span>
                  </td>
                  <td className="px-10 py-6 font-black text-emerald-600">${d.amount.toLocaleString()}</td>
                  <td className="px-10 py-6 text-xs font-bold text-slate-500">{d.date}</td>
                  <td className="px-10 py-6 text-right">
                    {activeTab === 'Personal' && (
                      <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-orange-600 transition-all flex items-center justify-center shadow-sm">
                        <i className="fas fa-file-invoice"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Donor Donation Modal (The functional part) */}
      {showDonorDonateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 md:p-14 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-10">
                 <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Support Our Initiatives</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                     {step === 1 ? 'Step 1: Impact Target & Amount' : step === 2 ? 'Step 2: Choose Payment Channel' : 'Step 3: Secure Processing'}
                   </p>
                 </div>
                 <button onClick={resetFlow} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"><i className="fas fa-times"></i></button>
              </div>

              {paymentSuccess ? (
                <div className="text-center py-12 animate-in zoom-in-95">
                   <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
                      <i className="fas fa-check"></i>
                   </div>
                   <h4 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Payment Received!</h4>
                   <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed">
                     Your contribution of <span className="font-black text-slate-900">${donorAmount.toLocaleString()}</span> has been verified. A member receipt has been added to your ledger.
                   </p>
                   <div className="flex flex-col gap-3">
                      <button onClick={resetFlow} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-black shadow-xl">Back to Dashboard</button>
                      <button className="w-full py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-50"><i className="fas fa-download mr-2"></i> Download Receipt</button>
                   </div>
                </div>
              ) : isProcessing ? (
                <div className="text-center py-16">
                   <div className="relative w-20 h-20 mx-auto mb-10">
                      <div className={`absolute inset-0 rounded-full border-4 border-slate-100`}></div>
                      <div className={`absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin`}></div>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Securing Transaction</h4>
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">{processStatus}</p>
                   {processStatus.includes("Handset") && (
                     <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left">
                        <p className="text-[10px] font-black text-slate-900 uppercase mb-2"><i className="fas fa-info-circle mr-1"></i> What to do next:</p>
                        <ul className="text-[10px] text-slate-500 space-y-1 font-medium list-disc ml-4">
                           <li>Check your phone for a push notification or USSD prompt.</li>
                           <li>Enter your Mobile Money PIN.</li>
                           <li>Wait for this screen to refresh automatically.</li>
                        </ul>
                     </div>
                   )}
                </div>
              ) : (
                <div className="space-y-8">
                   {step === 1 && (
                     <div className="animate-in fade-in duration-500 space-y-8">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Choose Allocation</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div 
                                onClick={() => setSelectedCampaign('General')}
                                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedCampaign === 'General' ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                              >
                                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm mb-4">
                                    <i className="fas fa-globe"></i>
                                 </div>
                                 <h4 className="font-black text-slate-900 uppercase text-xs">General Welfare</h4>
                                 <p className="text-[10px] text-slate-400 mt-1">High-impact flexible funding</p>
                              </div>
                              {activeCampaigns.map(camp => (
                                <div 
                                  key={camp.id}
                                  onClick={() => setSelectedCampaign(camp)}
                                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedCampaign !== 'General' && selectedCampaign?.id === camp.id ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                                >
                                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm mb-4">
                                      <i className="fas fa-bullhorn"></i>
                                   </div>
                                   <h4 className="font-black text-slate-900 uppercase text-xs line-clamp-1">{camp.name}</h4>
                                   <p className="text-[10px] text-slate-400 mt-1">Target: ${camp.targetAmount.toLocaleString()}</p>
                                </div>
                              ))}
                           </div>
                        </div>

                        {selectedCampaign && (
                          <div className="animate-in slide-in-from-top-4 duration-500 space-y-6">
                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Amount ($)</label>
                                <div className="flex gap-3 mb-4">
                                   {[25, 100, 250, 1000].map(val => (
                                      <button 
                                        key={val} 
                                        onClick={() => setDonorAmount(val)}
                                        className={`flex-grow py-3 rounded-xl font-black text-xs transition-all ${donorAmount === val ? 'bg-orange-600 text-white shadow-xl' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                      >
                                         ${val}
                                      </button>
                                   ))}
                                </div>
                                <input 
                                  type="number" 
                                  placeholder="Enter custom amount..."
                                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-black text-xl text-slate-900"
                                  value={donorAmount || ''}
                                  onChange={e => setDonorAmount(Number(e.target.value))}
                                />
                             </div>
                             <button 
                               onClick={() => { if(donorAmount > 0) setStep(2); else notify("Enter amount"); }}
                               className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-xl uppercase text-xs tracking-widest"
                             >
                                Continue to Payment
                             </button>
                          </div>
                        )}
                     </div>
                   )}

                   {step === 2 && (
                     <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Payment Method</label>
                           <div className="grid grid-cols-1 gap-4">
                              <div 
                                onClick={() => setPaymentMethod('MTN')}
                                className={`flex items-center justify-between p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${paymentMethod === 'MTN' ? 'border-yellow-400 bg-yellow-50 shadow-lg' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm">M</div>
                                    <div>
                                       <h4 className="font-black text-slate-900 uppercase text-xs">MTN Mobile Money</h4>
                                       <p className="text-[10px] text-slate-400 mt-1">Instant Ugandan MoMo Transfer</p>
                                    </div>
                                 </div>
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'MTN' ? 'border-yellow-500 bg-yellow-500 text-white' : 'border-slate-200'}`}>
                                    {paymentMethod === 'MTN' && <i className="fas fa-check text-[10px]"></i>}
                                 </div>
                              </div>

                              <div 
                                onClick={() => setPaymentMethod('AIRTEL')}
                                className={`flex items-center justify-between p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${paymentMethod === 'AIRTEL' ? 'border-red-500 bg-red-50 shadow-lg' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm">A</div>
                                    <div>
                                       <h4 className="font-black text-slate-900 uppercase text-xs">Airtel Money</h4>
                                       <p className="text-[10px] text-slate-400 mt-1">Instant Airtel Money Payment</p>
                                    </div>
                                 </div>
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'AIRTEL' ? 'border-red-500 bg-red-500 text-white' : 'border-slate-200'}`}>
                                    {paymentMethod === 'AIRTEL' && <i className="fas fa-check text-[10px]"></i>}
                                 </div>
                              </div>

                              <div 
                                onClick={() => setPaymentMethod('CARD')}
                                className={`flex items-center justify-between p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fas fa-credit-card"></i></div>
                                    <div>
                                       <h4 className="font-black uppercase text-xs">Credit/Debit Card</h4>
                                       <p className="text-[10px] opacity-50 mt-1">International Visa / Mastercard</p>
                                    </div>
                                 </div>
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-white bg-white text-slate-900' : 'border-slate-200'}`}>
                                    {paymentMethod === 'CARD' && <i className="fas fa-check text-[10px]"></i>}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {paymentMethod && (
                          <div className="animate-in slide-in-from-top-4 duration-500 space-y-6">
                             {paymentMethod !== 'CARD' ? (
                               <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recipient Phone Number</label>
                                  <div className="relative">
                                     <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">+256</span>
                                     <input 
                                       type="tel"
                                       placeholder="Phone number"
                                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-20 pr-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-black text-lg"
                                       value={phoneNumber}
                                       onChange={e => setPhoneNumber(e.target.value)}
                                     />
                                  </div>
                                  <p className="text-[9px] text-slate-400 mt-2 font-medium italic">Standard network processing fees may apply.</p>
                               </div>
                             ) : (
                               <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-[2rem] text-center">
                                  <i className="fas fa-globe text-2xl text-slate-300 mb-3"></i>
                                  <p className="text-[10px] font-black uppercase text-slate-400">Card Payment Interface will launch on authorize</p>
                               </div>
                             )}

                             <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-grow py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest">Back</button>
                                <button 
                                  onClick={handleProcessPayment}
                                  className={`flex-[2] py-6 text-white font-black rounded-3xl transition-all shadow-xl uppercase text-xs tracking-widest ${paymentMethod === 'MTN' ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-100' : paymentMethod === 'AIRTEL' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-slate-900 hover:bg-black'}`}
                                >
                                   Authorize Secure Gift
                                </button>
                             </div>
                          </div>
                        )}
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>
      )}

      {/* Manual Log Modal (Old functionality kept for Admins) */}
      {showLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black uppercase tracking-tighter">Manual Ledger Entry</h3><button onClick={() => setShowLogModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"><i className="fas fa-times"></i></button></div>
              <div className="space-y-6">
                 <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Donor Name</label><input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold" value={newDonation.donorName} onChange={e => setNewDonation({...newDonation, donorName: e.target.value})} placeholder="Enter donor name" /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount ($)</label><input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold" value={newDonation.amount || ''} onChange={e => setNewDonation({...newDonation, amount: Number(e.target.value)})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Campaign</label><select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 font-bold" value={newDonation.campaignId} onChange={e => setNewDonation({...newDonation, campaignId: e.target.value})}><option value="General">General Fund</option>{activeCampaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                 </div>
                 <button onClick={handleManualLog} className="w-full py-5 bg-emerald-600 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-emerald-700 shadow-xl transition-all">Verify & Commit to Ledger</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DonationsManager;
