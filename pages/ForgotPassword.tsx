
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COLORS, BRAND } from '../constants';
import { getUsers, resetUserPassword } from '../services/mockData';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const users = getUsers();
      const cleanId = identifier.toLowerCase().trim();
      const found = users.find(u => u.email.toLowerCase() === cleanId || (u.phone && u.phone.trim() === cleanId));
      
      if (found) {
        setUserId(found.id);
        setStep(2);
      } else {
        setError("We couldn't find an account associated with that email or phone number.");
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      resetUserPassword(userId, newPassword);
      setStep(3);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-inter">
      <Link 
        to="/login" 
        className="mb-8 flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-orange-600 transition-all group"
      >
        <i className="fas fa-arrow-left transition-transform group-hover:-translate-x-1"></i> 
        Back to Login
      </Link>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
        <div className="p-10 text-center text-white bg-slate-900">
           <h2 className="text-2xl font-black tracking-tighter uppercase mb-1">Account Recovery</h2>
           <p className="text-orange-500 text-[9px] font-black uppercase tracking-widest">Verify identity to reset access</p>
        </div>

        <div className="p-10 md:p-12">
           {step === 1 && (
             <form onSubmit={handleVerify} className="space-y-6 animate-in slide-in-from-bottom-4">
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                  Enter the email address or phone number associated with your account. We'll verify your record in our system.
                </p>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl border border-red-100 mb-6">
                    {error}
                  </div>
                )}

                <div>
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Email or Phone</label>
                   <input 
                     required
                     type="text" 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                     placeholder="Email address or phone number"
                     value={identifier}
                     onChange={e => setIdentifier(e.target.value)}
                   />
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full py-5 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-orange-700 shadow-xl shadow-orange-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Verify Record'}
                </button>
             </form>
           )}

           {step === 2 && (
             <form onSubmit={handleReset} className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <i className="fas fa-check-circle text-emerald-500"></i>
                   <p className="text-emerald-700 text-[10px] font-bold uppercase">Identity Verified. Proceed with reset.</p>
                </div>

                <div>
                   <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">New Password</label>
                   <input 
                     required
                     type="password" 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                     placeholder="Create a new password"
                     value={newPassword}
                     onChange={e => setNewPassword(e.target.value)}
                   />
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black shadow-xl flex items-center justify-center gap-2"
                >
                  {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Update Password'}
                </button>
             </form>
           )}

           {step === 3 && (
             <div className="text-center py-6 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
                  <i className="fas fa-shield-check"></i>
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Security Updated</h4>
                <p className="text-slate-500 text-xs mb-10 leading-relaxed font-medium">Your credentials have been successfully updated. You can now access the portal with your new password.</p>
                <Link to="/login" className="block w-full py-5 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-orange-700 shadow-xl shadow-orange-100">Proceed to Login</Link>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
