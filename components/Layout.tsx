import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BRAND, COLORS } from "../constants";
import logo from "../assets/logo.png";

/* ================= NAVBAR ================= */

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Transparency", path: "/transparency" },
    { name: "Campaigns", path: "/campaigns" },
    { name: "Volunteer", path: "/volunteer" },
    { name: "News", path: "/news" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white/95 border-b-2" style={{ borderColor: COLORS.secondary }}>
      <div className="max-w-8xl mx-auto px-4">
        <div className="flex justify-between h-16 md:h-20 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Naanghirisa" className="h-10 md:h-16 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[12px] font-bold uppercase tracking-tight transition-colors
                ${location.pathname === item.path
                    ? "text-red-900 border-b-2 border-orange-500"
                    : "text-slate-600 hover:text-orange-500"
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/login"
              className="px-5 py-3 text-[10px] font-black text-white rounded-lg shadow-md hover:scale-105 transition-all"
              style={{ backgroundColor: COLORS.primary }}
            >
              DONOR PORTAL
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700"
          >
            <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <img src={logo} alt="Naanghirisa" className="h-12" />
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-black uppercase tracking-widest text-slate-800 hover:text-orange-600"
                >
                  {item.name}
                </Link>
              ))}

              <Link
                to="/login"
                className="mt-6 block py-4 bg-orange-600 text-white text-center font-black rounded-xl uppercase tracking-widest"
              >
                DONOR PORTAL
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

/* ================= FOOTER ================= */

const Footer: React.FC = () => {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for subscribing!");
  };

  const socials = [
    { icon: "fa-facebook-f", bg: "bg-blue-600" },
    { icon: "fa-x", bg: "bg-black" },
    { icon: "fa-instagram", bg: "bg-pink-600" },
    { icon: "fa-whatsapp", bg: "bg-green-600" },
    { icon: "fa-youtube", bg: "bg-red-600" },
  ];

  return (
    <footer className="bg-slate-950 text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">

        {/* Footer Top */}
        <div className="grid lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Naanghirisa" className="h-10 md:h-16 w-auto bg-white/50 rounded-lg items-center justify-center
                hover:scale-110 hover:rotate-3 transition-all" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Changing life of the less privileged
            </p>
            <div className="flex gap-3">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center
                hover:scale-110 hover:rotate-3 transition-all`}
                >
                  <i className={`fab ${s.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Organisation */}
          <div>
            <h4 className="text-orange-500 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">
              Organisation
            </h4>
            <ul className="space-y-3 text-sm font-bold text-slate-400">
              <li><Link to="/about" className="hover:text-white">Who We Are</Link></li>
              <li><Link to="/programs" className="hover:text-white">What We Do</Link></li>
              <li><Link to="/transparency" className="hover:text-white">Transparency</Link></li>
              <li><Link to="/campaigns" className="hover:text-white">Campaigns</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-orange-500 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">
              Resources
            </h4>
            <ul className="space-y-3 text-sm font-bold text-slate-400">
              <li><Link to="/news" className="hover:text-white">Impact Stories</Link></li>
              <li><Link to="/volunteer" className="hover:text-white">Volunteer</Link></li>
              <li><Link to="/news" className="hover:text-white">Latest News</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contacts</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-orange-500 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">
              Newsletter
            </h4>
            <form onSubmit={handleSubscribe} className="space-y-4 max-w-sm">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
              />
              <button className="w-full py-3 bg-orange-600 font-black rounded-xl hover:bg-orange-700 transition-all">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
            &copy; {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ================= LAYOUT ================= */

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);
