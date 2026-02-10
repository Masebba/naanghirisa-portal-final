import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BRAND, COLORS } from "../constants";
import { authService } from "../services/authService";
import logo from "../assets/logo.png";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("admin@naanghirisa.org");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const user = authService.login(identifier, password);
      if (user) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Check your email/phone and password.");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[45%_55%]">
      {/* ================= LEFT PANEL ================= */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white items-center text-center justify-center"
        style={{ backgroundColor: COLORS.primary }}
      >
        <div>
          <h1 className="text-4xl font-black mb-4 mt-20">Welcome to the Donor Portal</h1>
          <p className="text-red-100 max-w-md mb-12 leading-relaxed">
            Access the Naanghirisa Organisation portal to manage programs,
            track missions, and view financial reports.
          </p>
          <div className="grid grid-cols-2 gap-6 ">
            {[
              { label: "Active Volunteers", value: "156" },
              { label: "Programs Running", value: "89" },
              { label: "Efficiency Rate", value: "92%" },
              { label: "Total Raised", value: "$485K" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs uppercase tracking-widest text-red-100">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-red-200">
          © {new Date().getFullYear()} Naanghirisa Organisation
        </p>
      </div>
      {/* ================= RIGHT PANEL ================= */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF7F1] p-6 font-inter">
        {/* Back link*/}
        <Link to="/"
          className="mb-5 flex items-center gap-2 text-slate-500 font-black text-[12px] tracking-[0.2em] hover:text-orange-600 transition-all group"
        >
          <i className="fas fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
          Back to Website
        </Link>

        <div className="w-full max-w-md lg:w-2/5 bg-white rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="p-2 text-center text-red-800 relative flex flex-col items-center">
            <div className="w-auto h-16 rounded-lg bg-white/10 flex items-center justify-center">
              {/* Logo*/}
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Naanghirisa" className="h-8 md:h-10 w-auto" />
              </Link>
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-2 ">Welcome Back</h2>
            <p className="text-gray-600 text-[10px] font-black tracking-[0.25em]">Sign in to access the Donor portal</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-in shake-in duration-300">
                <i className="fas fa-exclamation-circle text-lg"></i> {error}
              </div>
            )}

            <form className="space-y-2" onSubmit={handleLogin}>
              <div>
                <label className="block text-[10px] font-black text-slate-400 tracking-widest mb-2">Email or Phone Number</label>
                <div className="relative">
                  <i className="fas fa-user-circle absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-6 py-2 outline-none focus:ring-1 focus:ring-orange-500 transition-all text-slate-900"
                    placeholder="email@example.com or 07..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 tracking-widest mb-3">Password</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-6 py-2 outline-none focus:ring-1 focus:ring-orange-500 transition-all text-slate-900"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <p className="mt-2 text-[10px] font-bold text-slate-400 text-center tracking-widest">Initial access? Use the default credentials</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-white font-black text-xs tracking-[0.2em] rounded-lg shadow-2xl shadow-orange-100 hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                style={{ backgroundColor: COLORS.primary }}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>Sign In <i className="fas fa-arrow-right ml-1 transition-transform group-hover:translate-x-2"></i></>
                )}
              </button>
            </form>

            <div className="mt-2 flex flex-col gap-4 text-center">
              <Link to="/forgot-password" title="Recover Password" className="text-[10px] font-black tracking-widest text-slate-400 hover:text-red-900 transition-colors">Forgot Password?</Link>

              <p className="text-[9px] text-slate-400 tracking-tight leading-relaxed">
                By logging in, you agree to our security protocols. Access to this portal is logged and monitored for transparency.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[10px] font-black text-slate-400 tracking-widest">
          Powered by PILATUS TECH
        </p>
      </div>
    </div>
  );
};

export default Login;
