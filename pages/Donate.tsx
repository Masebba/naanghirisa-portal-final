
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getCampaigns, getPrograms, addDonation, addUser, getUsers } from '../services/mockData';
import { COLORS, BRAND } from '../constants';
import { authService } from '../services/authService';
import { Campaign, Program, UserRole, User } from '../types';

type PaymentMethod = 'MTN' | 'AIRTEL' | 'CARD';

const Donate: React.FC = () => {
  const location = useLocation();
  const user = authService.getCurrentUser();
  const searchParams = new URLSearchParams(location.search);
  const initialCampaignId = searchParams.get('campaign');
  const initialProgramId = searchParams.get('program');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTarget, setSelectedTarget] = useState<{id: string, name: string, type: 'Campaign' | 'Program' | 'General'} | null>(null);
  const [amount, setAmount] = useState<number>(0);
  
  // Guest Identity States
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMsg, setProcessMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const campaigns = getCampaigns().filter(c => c.status === 'Active');
  const programs = getPrograms();

  useEffect(() => {
    if (initialCampaignId) {
      const found = campaigns.find(c => c.id === initialCampaignId);
      if (found) setSelectedTarget({ id: found.id, name: found.name, type: 'Campaign' });
    } else if (initialProgramId) {
      const found = programs.find(p => p.id === initialProgramId);
      if (found) setSelectedTarget({ id: found.id, name: found.name, type: 'Program' });
    }
  }, [initialCampaignId, initialProgramId, campaigns, programs]);

  const handleProcess = () => {
    if ((paymentMethod === 'MTN' || paymentMethod === 'AIRTEL') && phone.length < 9) {
      alert("Please enter a valid Ugandan phone number.");
      return;
    }

    setIsProcessing(true);
    setProcessMsg(`Connecting to ${paymentMethod} Gateway...`);

    // Simulated Secure Handshake
    setTimeout(() => {
      setProcessMsg("Waiting for authorization on your mobile device...");
      setTimeout(() => {
        setProcessMsg("PIN Verified. Syncing Identity & Ledger...");
        setTimeout(() => {
          const targetId = selectedTarget?.id || 'General';
          const targetCategory = selectedTarget?.type === 'Campaign' ? 'Campaign Support' : 
                                selectedTarget?.type === 'Program' ? 'Program Fund' : 'General Welfare';

          const finalName = user?.name || guestName || 'Public Supporter';
          const finalEmail = user?.email || guestEmail;
          const finalPhone = user?.phone || (paymentMethod !== 'CARD' ? `0${phone.replace(/^0+/, '')}` : '');

          // AUTOMATIC ACCOUNT PROVISIONING FOR GUESTS
          if (!user && finalEmail) {
             const existingUsers = getUsers();
             const alreadyExists = existingUsers.find(u => u.email.toLowerCase() === finalEmail.toLowerCase() || (finalPhone && u.phone === finalPhone));
             
             if (!alreadyExists) {
                const newUser: User = {
                   id: `u${Date.now()}`,
                   name: finalName,
                   email: finalEmail,
                   phone: finalPhone,
                   role: UserRole.DONOR,
                   password: 'user123', // Default temporary password as per guideline
                   avatar: `https://i.pravatar.cc/150?u=${finalEmail}`
                };
                addUser(newUser);
             }
          }

          addDonation({
            id: `gift-${Date.now()}`,
            donorName: finalName,
            amount: amount,
            campaignId: targetId,
            category: targetCategory,
            date: new Date().toISOString().split('T')[0],
            description: `Gift to ${selectedTarget?.name || 'General Fund'} via ${paymentMethod}`
          });
          
          setIsProcessing(false);
          setSuccess(true);
        }, 1500);
      }, 3000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6 font-inter">
        <div className="bg-white max-w-xl w-full rounded-[4rem] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-500 border border-orange-100">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
            <i className="fas fa-heart"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Impact Confirmed!</h2>
          <p className="text-slate-600 mb-6 leading-relaxed text-lg">
            Your generous gift of <span className="font-black text-slate-900">${amount.toLocaleString()}</span> has been processed. 
          </p>
          
          {!user && (
            <div className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
               <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2"><i className="fas fa-user-plus text-orange-500 mr-2"></i> Account Provisioned</p>
               <p className="text-[11px] text-slate-500 leading-relaxed">
                 We've created a donor account for you. You can now log in to the portal using your email and the default password: <span className="font-black text-orange-600">user123</span> to view your impact certificates and tax receipts.
               </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
             {!user ? (
               <Link to="/login" className="py-5 bg-orange-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-orange-700 shadow-xl transition-all">Go to Portal Log In</Link>
             ) : (
               <Link to="/dashboard/donations" className="py-5 bg-slate-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-black shadow-xl transition-all">View Donation Record</Link>
             )}
             <Link to="/" className="py-5 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 font-inter">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4" style={{ color: COLORS.primary }}>Change a Life Today</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Step {step} of 4: {
            step === 1 ? 'Target Selection' : 
            step === 2 ? 'Amount & Identity' : 
            step === 3 ? 'Payment Method' : 'Confirmation'
          }</p>
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-200 relative">
          {isProcessing && (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin mb-8"></div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Secure Processing</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">{processMsg}</p>
              {processMsg.includes("authorization") && (
                <p className="mt-8 text-xs text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-full border border-orange-100 animate-bounce">Please authorize on your phone screen</p>
              )}
            </div>
          )}

          <div className="p-10 md:p-16">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Select your impact target</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setSelectedTarget({id: 'General', name: 'General Welfare', type: 'General'})}
                    className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all ${selectedTarget?.id === 'General' ? 'border-orange-500 bg-orange-50 shadow-xl' : 'border-slate-100 bg-slate-50 hover:border-orange-200'}`}
                  >
                    <i className="fas fa-globe text-3xl mb-6 text-orange-600"></i>
                    <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">General Welfare</h4>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Flexible funding for the most urgent community needs.</p>
                  </div>
                  
                  {campaigns.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedTarget({id: c.id, name: c.name, type: 'Campaign'})}
                      className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all ${selectedTarget?.id === c.id ? 'border-orange-500 bg-orange-50 shadow-xl' : 'border-slate-100 bg-slate-50 hover:border-orange-200'}`}
                    >
                      <i className="fas fa-bullhorn text-3xl mb-6 text-orange-600"></i>
                      <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 truncate">{c.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Active Campaign</p>
                    </div>
                  ))}

                  {programs.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedTarget({id: p.id, name: p.name, type: 'Program'})}
                      className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all ${selectedTarget?.id === p.id ? 'border-orange-500 bg-orange-50 shadow-xl' : 'border-slate-100 bg-slate-50 hover:border-orange-200'}`}
                    >
                      <i className="fas fa-heart-pulse text-3xl mb-6 text-orange-600"></i>
                      <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Core Program</p>
                    </div>
                  ))}
                </div>
                <button 
                  disabled={!selectedTarget}
                  onClick={() => setStep(2)}
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-black disabled:opacity-50 transition-all shadow-xl"
                >
                  Continue to Identity & Amount
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-10">
                <div className="flex items-center justify-between">
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Gift Amount</h3>
                   <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-lg">Target: {selectedTarget?.name}</span>
                </div>
                
                {!user && (
                   <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <div className="md:col-span-2 flex items-center justify-between">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor Information (For automated receipting)</p>
                         <Link to="/login" className="text-[9px] font-black text-orange-600 uppercase underline">Already a member? Log In</Link>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Name</label>
                        <input 
                           className="w-full bg-white border border-slate-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                           placeholder="e.g. John Doe"
                           value={guestName}
                           onChange={e => setGuestName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input 
                           type="email"
                           className="w-full bg-white border border-slate-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                           placeholder="email@example.com"
                           value={guestEmail}
                           onChange={e => setGuestEmail(e.target.value)}
                        />
                      </div>
                   </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[25, 50, 100, 500].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-6 rounded-2xl font-black text-lg transition-all ${amount === val ? 'bg-orange-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-orange-300'}`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <div className="relative">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Or enter custom amount ($)</label>
                   <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-6 outline-none focus:ring-2 focus:ring-orange-500 font-black text-3xl text-slate-900" 
                      placeholder="0.00"
                      value={amount || ''}
                      onChange={e => setAmount(Number(e.target.value))}
                   />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-grow py-6 bg-slate-100 text-slate-500 font-black rounded-3xl uppercase text-xs tracking-widest">Back</button>
                  <button 
                    disabled={amount <= 0 || (!user && (!guestName || !guestEmail))}
                    onClick={() => setStep(3)}
                    className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl uppercase text-xs tracking-widest hover:bg-black disabled:opacity-50 shadow-xl"
                  >
                    Select Payment Method
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">How will you give?</h3>
                <div className="grid gap-4">
                  <div 
                    onClick={() => setPaymentMethod('MTN')}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === 'MTN' ? 'border-yellow-400 bg-yellow-50 shadow-lg' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-2xl text-white">M</div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase text-sm">MTN Mobile Money</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Verified MoMo Gateway (UG)</p>
                      </div>
                    </div>
                    {paymentMethod === 'MTN' && <i className="fas fa-check-circle text-yellow-500 text-xl"></i>}
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('AIRTEL')}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === 'AIRTEL' ? 'border-red-500 bg-red-50 shadow-lg' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white">A</div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase text-sm">Airtel Money</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Verified Airtel Gateway (UG)</p>
                      </div>
                    </div>
                    {paymentMethod === 'AIRTEL' && <i className="fas fa-check-circle text-red-500 text-xl"></i>}
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('CARD')}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl"><i className="fas fa-credit-card"></i></div>
                      <div>
                        <h4 className="font-black uppercase text-sm">International Card</h4>
                        <p className="text-[10px] opacity-60 font-medium">Visa / Mastercard / Amex</p>
                      </div>
                    </div>
                    {paymentMethod === 'CARD' && <i className="fas fa-check-circle text-white text-xl"></i>}
                  </div>
                </div>

                {paymentMethod && paymentMethod !== 'CARD' && (
                  <div className="animate-in slide-in-from-top-4">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">UG Registered Number</label>
                     <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">+256</span>
                        <input 
                           type="tel" 
                           placeholder="770 000 000"
                           className="w-full bg-slate-50 border border-slate-100 rounded-3xl pl-20 pr-8 py-6 outline-none focus:ring-2 focus:ring-orange-500 font-black text-2xl"
                           value={phone}
                           onChange={e => setPhone(e.target.value)}
                        />
                     </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-grow py-6 bg-slate-100 text-slate-500 font-black rounded-3xl uppercase text-xs tracking-widest">Back</button>
                  <button 
                    disabled={!paymentMethod || (paymentMethod !== 'CARD' && phone.length < 9)}
                    onClick={handleProcess}
                    className={`flex-[2] py-6 text-white font-black rounded-3xl uppercase text-xs tracking-widest transition-all shadow-xl disabled:opacity-50 ${paymentMethod === 'MTN' ? 'bg-yellow-500' : paymentMethod === 'AIRTEL' ? 'bg-red-600' : 'bg-slate-900'}`}
                  >
                    Process Secure Contribution
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
          Naanghirisa Organisation is a registered CBO.<br/>
          Secure processing ensured by 256-bit SSL encryption.
        </p>
      </div>
    </div>
  );
};

export default Donate;
