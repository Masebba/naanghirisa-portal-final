import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPassword: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.sendPasswordReset(identifier);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-orange-100/30">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Reset password</h1>
          <p className="mt-2 text-xs font-medium text-slate-500">Enter the email address for your portal account.</p>
        </div>

        {sent ? (
          <div className="animate-in fade-in">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <i className="fas fa-check-circle text-4xl"></i>
              </div>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Check your inbox</h4>
            <p className="text-slate-500 text-xs mb-10 leading-relaxed font-medium">A password reset link has been sent for the matching account.</p>
            <Link to="/login" className="block w-full py-5 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-orange-700 shadow-xl shadow-orange-100">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6 animate-in slide-in-from-bottom-4">
            {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl border border-red-100 mb-6">{error}</div>}

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Email address</label>
              <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold" placeholder="name@organisation.org" value={identifier} onChange={e => setIdentifier(e.target.value)} />
            </div>

            <button disabled={isLoading} className="w-full py-5 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-orange-700 shadow-xl shadow-orange-100 flex items-center justify-center gap-2">
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
