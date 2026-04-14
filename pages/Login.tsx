import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BRAND, COLORS } from '../constants';
import { authService } from '../services/authService';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          <img src={logo} alt={BRAND.fullName} className="h-24 w-auto mb-10 bg-white/10 rounded-3xl p-4" />
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight mb-6">Secure portal access</h1>
          <p className="text-red-100 text-lg leading-relaxed mb-10">
            Manage programmes, transparency, donations, volunteer activity, and organisational content from one secure place.
          </p>
          <div className="grid gap-4 text-sm font-bold text-red-100">
            <div className="flex items-center gap-3"><i className="fas fa-shield-halved"></i> Role-based access control</div>
            <div className="flex items-center gap-3"><i className="fas fa-database"></i> Firestore-backed records</div>
            <div className="flex items-center gap-3"><i className="fas fa-sitemap"></i> Full site content management</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-orange-100">
            <div className="text-center mb-10">
              <img src={logo} alt="Logo" className="h-20 w-auto mx-auto mb-6" />
              <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>Sign in</h2>
              <p className="text-slate-500 text-sm mt-2">Use your Firebase-authenticated account.</p>
            </div>

            {error && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
              <input type="email" required placeholder="Email address" value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 outline-none focus:ring-2 focus:ring-orange-200" />
              <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 outline-none focus:ring-2 focus:ring-orange-200" />
              <button type="submit" disabled={isLoading} className="w-full rounded-2xl py-4 font-black text-white transition disabled:opacity-60" style={{ backgroundColor: COLORS.primary }}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              Need account help? Contact a Super Admin.
            </div>
          </div>
          <div className="mt-6 text-center"><Link to="/" className="text-sm font-bold text-slate-500 hover:text-orange-600">Back to website</Link></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
