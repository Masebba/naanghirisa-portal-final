import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BRAND, COLORS } from "../constants";
import { authService } from "../services/authService";
import logo from "../assets/logo.png";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await authService.login(identifier, password);
      if (user) {
        navigate("/dashboard");
        return;
      }
      setError(
        "Invalid credentials. Please confirm your email address and password.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in right now.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[52%_48%] bg-[#fff7ed]">
      <div className="hidden lg:flex flex-col justify-center p-10 text-white bg-red-900 ">
        <div className="max-w-md mx-auto">
          <img
            src={logo}
            alt={BRAND.fullName}
            className="h-20 w-auto mb-8 bg-white/10 rounded-lg p-3"
          />
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight mb-5">
            Secure portal access
          </h1>
          <p className="text-red-100 text-base leading-relaxed mb-8">
            Welcome back, and thank you for your generous support. Please log in
            to manage your donations, view your giving history, and update your
            account details.
          </p>
          <div className="grid gap-3 text-sm font-bold text-red-100">
            <div className="flex items-center gap-3">
              <i className="fas fa-shield-halved" /> First time here? Contact
              Administrator
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-database" /> For your security, please sign
              out when you are done.
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-sitemap" /> Need help signing in? Contact
              support.
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-xs">
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-2xl border border-orange-100">
            <div className="text-center mb-8">
              <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4" />
              <h2
                className="text-3xl font-black uppercase tracking-tighter"
                style={{ color: COLORS.primary }}
              >
                Sign in
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Use your authenticated account.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email address"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-200"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm px-2 py-1 text-slate-400 transition hover:text-slate-700"
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg py-3 font-black text-white transition disabled:opacity-60"
                style={{ backgroundColor: COLORS.primary }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-1 flex items-end justify-end text-[10px] text-slate-400 font-bold tracking-widest">
              <Link to="/forgot-password" className="hover:text-orange-600">
                Forgot password
              </Link>
            </div>
            <div className="mt-2 flex text-center justify-center text-[10px] text-slate-400 font-bold">
              <span>Need account help? Contact a Super Admin.</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm font-bold text-slate-500 hover:text-orange-600"
            >
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
