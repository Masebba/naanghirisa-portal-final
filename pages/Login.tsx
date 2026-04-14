import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BRAND, COLORS } from '../constants';
import { authService } from '../services/authService';
import { UserRole } from '../types';
import logo from '../assets/logo.png';

type BootstrapStatus = {
  completed: boolean;
  superAdminEmail?: string;
  superAdminUid?: string;
  createdAt?: string;
  updatedAt?: string;
  note?: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');

  const loadBootstrapStatus = async () => {
    setStatusLoading(true);
    try {
      const status = await authService.getBootstrapStatus();
      setBootstrapStatus(status);
    } catch {
      setBootstrapStatus({ completed: false, note: 'read-failed' });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const admin = await authService.bootstrapInitialAdmin({
        name: setupName,
        email: setupEmail,
        password: setupPassword,
        phone: '',
        role: UserRole.SUPER_ADMIN,
        avatar: '',
      });
      if (admin) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create the first administrator right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBootstrapStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await authService.login(identifier, password);
      if (user) {
        navigate('/dashboard');
        return;
      }
      setError('Invalid credentials. Please confirm your email address and password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[45%_55%] bg-[#fff7ed]">
      <div className="hidden lg:flex flex-col justify-center p-12 text-white" style={{ backgroundColor: COLORS.primary }}>
        <div className="max-w-md mx-auto">
          <span className="inline-flex px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Donor & Admin Portal
          </span>
          <h1 className="text-4xl font-black mb-4 leading-tight">Welcome to Naanghirisa</h1>
          <p className="text-orange-50 max-w-md mb-10 leading-relaxed text-sm">
            Manage programmes, transparency, donations, volunteer activity, and organisational content from one secure place.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Secure Access', value: 'Role-based' },
              { label: 'Public Impact', value: 'Live Portal' },
              { label: 'Transparency', value: 'Auditable' },
              { label: 'Brand', value: BRAND.name },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-lg font-black">{item.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-orange-50/80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Link to="/" className="mb-6 flex items-center gap-2 text-slate-500 font-black text-[11px] tracking-[0.25em] uppercase hover:text-orange-600 transition-colors">
          <i className="fas fa-arrow-left" />
          Back to website
        </Link>

        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_32px_80px_-24px_rgba(15,23,42,0.25)] border border-orange-100 overflow-hidden">
          <div className="p-8 text-center border-b border-orange-50">
            <Link to="/" className="inline-flex items-center justify-center mb-4">
              <img src={logo} alt="Naanghirisa" className="h-12 w-auto" />
            </Link>
            <h2 className="text-2xl font-black tracking-tight">Sign in</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Use your assigned portal email and password
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email address</label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="name@organisation.org"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-orange-600 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-100 transition hover:bg-orange-700 disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Link to="/forgot-password" className="hover:text-orange-600 transition-colors">Forgot password?</Link>
              <button type="button" onClick={() => void loadBootstrapStatus()} className="hover:text-orange-600 transition-colors">
                {statusLoading ? 'Checking setup…' : 'Recheck setup'}
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-orange-100 bg-orange-50/60 p-5 text-sm text-slate-700">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">First administrator setup</h3>
              <p className="mt-2 leading-relaxed">
                When no admin exists yet, use this form once to create the first Super Admin account in Firebase Auth and Firestore.
              </p>

              {bootstrapStatus?.completed ? (
                <div className="mt-4 rounded-2xl bg-white p-4 border border-emerald-100">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Bootstrap complete</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    The first administrator has already been provisioned. Use the sign-in form above.
                  </p>
                </div>
              ) : (
                <form className="mt-4 space-y-3 rounded-2xl bg-white p-4 border border-orange-100" onSubmit={handleBootstrap}>
                  <input value={setupName} onChange={e => setSetupName(e.target.value)} required placeholder="First admin full name" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
                  <input value={setupEmail} onChange={e => setSetupEmail(e.target.value)} required type="email" placeholder="First admin email" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
                  <input value={setupPassword} onChange={e => setSetupPassword(e.target.value)} required type="password" placeholder="Strong password" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
                  <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-slate-900 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-black disabled:opacity-60">
                    Create first admin
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
