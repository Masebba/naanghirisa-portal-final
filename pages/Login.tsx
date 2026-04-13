import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BRAND, COLORS } from "../constants";
import { authService } from "../services/authService";
import { getUsers } from "../services/mockData";
import { UserRole } from "../types";
import logo from "../assets/logo.png";

const emptyAdmin = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const hasUsers = useMemo(() => getUsers().length > 0, []);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [setupForm, setSetupForm] = useState(emptyAdmin);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const user = authService.login(identifier, password);
    if (user) {
      navigate("/dashboard");
      return;
    }

    setError(
      "Invalid credentials. Please confirm your email or phone number and password.",
    );
    setIsLoading(false);
  };

  const handleBootstrap = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      authService.registerUser({
        id: `u_${Date.now()}`,
        name: setupForm.name.trim(),
        email: setupForm.email.trim(),
        phone: setupForm.phone.trim(),
        password: setupForm.password,
        role: UserRole.SUPER_ADMIN,
      });
      const user = authService.login(setupForm.email, setupForm.password);
      if (user) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create the initial administrator account.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[45%_55%] bg-[#fff7ed]">
      <div className="hidden lg:flex flex-col justify-center p-12 text-white bg-red-950">
        <div className="max-w-md mx-auto">
          <span className="inline-flex px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Donor & Admin Portal
          </span>
          <h1 className="text-4xl font-black mb-4 leading-tight">
            Welcome to Naanghirisa
          </h1>
          <p className="text-orange-50 max-w-md mb-10 leading-relaxed text-sm">
            Manage programmes, transparency, donations, volunteer activity, and
            organisational content from one secure place.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { label: "Secure Access", value: "Role-based" },
              { label: "Public Impact", value: "Live Portal" },
              { label: "Transparency", value: "Auditable" },
              { label: "Brand", value: BRAND.name },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm"
              >
                <p className="text-lg font-black">{item.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-orange-50/80">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Link
          to="/"
          className="mb-2 flex items-center gap-2 text-red-950 font-black text-[11px] tracking-[0.25em] uppercase hover:text-orange-600 transition-colors"
        >
          <i className="fas fa-arrow-left" />
          Back to website
        </Link>

        <div className="w-full max-w-sm bg-white rounded-sm shadow-[0_32px_80px_-24px_rgba(15,23,42,0.25)] border border-orange-100 overflow-hidden">
          <div className="p-2 text-center border-b border-orange-50">
            <Link
              to="/"
              className="inline-flex items-center justify-center mb-2"
            >
              <img src={logo} alt="Naanghirisa" className="h-10 w-auto" />
            </Link>
            <h2 className="text-2xl font-black tracking-tight">
              {hasUsers ? "Sign in" : "Create first administrator"}
            </h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              {hasUsers
                ? "Use your assigned portal credentials"
                : "Set up the organisation portal securely"}
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            {hasUsers ? (
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Email or phone
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="name@organisation.org"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-sm bg-orange-600 px-3 py-3 text-xs font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:opacity-70"
                >
                  {isLoading ? "Signing in…" : "Access portal"}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleBootstrap}>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={setupForm.name}
                    onChange={(e) =>
                      setSetupForm({ ...setupForm, name: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Portal administrator"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={setupForm.email}
                    onChange={(e) =>
                      setSetupForm({ ...setupForm, email: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Email address"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={setupForm.phone}
                    onChange={(e) =>
                      setSetupForm({ ...setupForm, phone: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="07..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Password
                  </label>
                  <input
                    type="password"
                    value={setupForm.password}
                    onChange={(e) =>
                      setSetupForm({ ...setupForm, password: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-orange-600 px-5 py-4 text-xs font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:opacity-70"
                >
                  {isLoading ? "Creating…" : "Create administrator"}
                </button>
              </form>
            )}

            <div className="mt-2 flex flex-col items-center gap-3 text-center">
              {hasUsers && (
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-orange-600 transition-colors"
                >
                  Forgot password?
                </Link>
              )}
              <p className="max-w-sm text-[11px] leading-relaxed text-slate-400">
                Access is restricted to authorised users. Every session is
                logged for accountability.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Powered by PILATUS TECH
        </p>
      </div>
    </div>
  );
};

export default Login;
