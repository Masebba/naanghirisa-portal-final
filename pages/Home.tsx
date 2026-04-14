import React from "react";
import { Link } from "react-router-dom";
import { BRAND, COLORS } from "../constants";
import { addContactMessage, getPageContent, getPrograms } from '../services/mockData';

/* LOCAL IMAGES */
import heroBg from "../assets/images/hero-bg.jpg";
import heroImpact from "../assets/images/hero-impact.jpg";
import snap1 from "../assets/images/snapshot-1.jpg";
import snap2 from "../assets/images/snapshot-2.jpg";
import prog1 from "../assets/images/program-1.jpeg";
import prog2 from "../assets/images/program-2.jpeg";
import prog3 from "../assets/images/program-3.jpeg";
import prog4 from "../assets/images/program-4.jpg";
import vision from "../assets/images/vision.jpg";


const Home: React.FC = () => {
  const content = getPageContent();
  const programs = getPrograms();

  return (
    <div className="animate-in fade-in duration-700">

      {/* ================= HERO SECTION ================= */}
      <section
        className="relative min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(88,0,0,0.85), rgba(88,0,0,0.85)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center text-white">
          <div className="text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 bg-orange-500 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
              SINCE 2016
            </span>

            <h1 className="text-2xl md:text-4xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="text-white">{content.homeHeroTitle || BRAND.heroTitle}</span>
            </h1>

            <p className="text-lg md:text-xl text-red-100 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {content.homeHeroDescription || BRAND.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-3 px-10 py-2 bg-orange-600 text-white font-black rounded-lg shadow-xl hover:bg-orange-500 transition-all"
              >
                <i className="fas fa-hand-holding-heart"></i>
                DONATE NOW
              </Link>

              <Link
                to="/programs"
                className="px-10 py-2 bg-transparent border-2 border-orange-600 text-orange-600 font-black rounded-lg hover:bg-red-950/50 hover:text-white transition-all text-center"
              >
                OUR PROGRAMS
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <img
              src={heroImpact}
              alt="Community Impact"
              className="rounded-[2.5rem] shadow-2xl border-4 border-white"
            />
          </div>
        </div>
      </section>

      {/* ================= SNAPSHOT ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="grid grid-cols-2 gap-6">
            <img src={snap1} alt="Community" className="rounded-xl shadow-xl" />
            <img src={snap2} alt="Education" className="rounded-xl shadow-3xl mt-10" />
          </div>

          <div className="text-center md:text-left">
            <span className="font-bold text-xs tracking-widest uppercase mb-4 block text-orange-600">
              Who We Are
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-red-900">
              {content.homeWhoWeAreTitle || 'Our Dedication to Local Impact'}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8 italic">
              {content.homeWhoWeAreText || 'Poverty, early marriage, teenage pregnancies, gender based violence, HIV and AIDS, and low participation in post-primary education are some of the situations attributed to Butaleja District. Adolescent girls, in particular, face multiple vulnerabilities.'}
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-8 italic">
              "We believe in taking consistent and progressive steps. We believe each one of us has a small,
              vital role to play in building our community. The purpose of this organisation is to champon,
              promote and protect the interests of Butaleja community together."
            </p>
            <Link
              to="/about"
              className="font-black text-sm uppercase tracking-widest inline-flex items-center gap-3 text-orange-600 hover:gap-5 transition-all"
            >
              Read More about us <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PROGRAMS ================= */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl font-black mb-4 text-red-900">What We Do</h2>
          <div className="w-16 h-1.5 mx-auto rounded-full bg-orange-500"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(programs.length ? programs.slice(0, 4) : [
            { id: "p1", name: "Education Support", description: "Scholarship, mentorship, and school materials", image: prog1 },
            { id: "p2", name: "Community Welfare", description: "Household support and emergency response", image: prog2 },
            { id: "p3", name: "Environmental Action", description: "Tree planting and climate awareness", image: prog3 },
            { id: "p4", name: "Health Campaigns", description: "Awareness, sanitation, and outreach", image: prog4 },
          ]).map((program: any, i) => (
            <div
              key={i}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="h-48 relative">
                <img
                  src={program.image || program.img}
                  alt={program.name || program.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4 p-2 bg-white rounded-xl text-orange-600 shadow-lg">
                  <i className={`fas ${program.icon || "fa-heart"}`}></i>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-black text-xl mb-3 text-red-900">
                  {program.name || program.title}
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  {program.description}
                </p>
                <Link
                  to="/programs"
                  className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:underline"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Future Initiatives Section (Maintaining existing style) */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter" style={{ color: COLORS.primary }}>Vision for Tomorrow</h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Naanghirisa is constantly looking ahead. Our dynamic programming model allows us to address emerging challenges.
            </p>
            <div className="grid gap-2">
              {[
                { title: 'Digital Learning Hubs', icon: 'fa-laptop-code' },
                { title: 'Youth Entrepreneurship Fund', icon: 'fa-rocket' },
                { title: 'Mobile Health Clinics', icon: 'fa-ambulance' },
                { title: 'Inspire Academy', icon: 'fa-school' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 p-2 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-orange-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform" style={{ color: COLORS.secondary }}>
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative -inset-4 rounded-[4rem] opacity-10 transform rotate-2" style={{ backgroundColor: COLORS.secondary }}></div>
            <img
              src={vision}
              alt="Future Vision"
              className="relative z-10 rounded-[3.5rem] shadow-2xl"
            />
            <div className="absolute -bottom-8 z-10 -right-8 p-10 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl max-w-xs border-4 border-white">
              <p className="text-orange-500 font-black text-3xl mb-2">2026</p>
              <p className="text-slate-300 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Our goal is to reach 5,000 community members through integrated systems.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Volunteer CTA */}
      <section className="py-20 relative overflow-hidden text-white" style={{ backgroundColor: COLORS.primary }}>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 hidden lg:block">
          <i className="fas fa-heart text-[30rem] rotate-12"></i>
        </div>
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Join Our Volunteer Team</h2>
            <p className="text-lg md:text-xl text-red-100 mb-10 leading-relaxed">
              Be part of the change. Our volunteers help us deliver care and empowerment directly to those who need it.
            </p>
            <Link to="/volunteer" className="inline-block px-12 py-4 bg-orange-500 text-white font-black rounded-full shadow-xl hover:bg-orange-600 transition-all">
              APPLY NOW
            </Link>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/20">
            <h4 className="text-xl md:text-2xl font-black mb-6 text-orange-400 uppercase tracking-tighter">Fast-Track Interest</h4>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const fd = new FormData(form);
              const name = String(fd.get('name') || '').trim();
              const email = String(fd.get('email') || '').trim();
              if (!name || !email) return;
              await addContactMessage({
                name,
                email,
                message: 'Volunteer interest submitted from the homepage.',
                category: 'Volunteer interest',
              });
              form.reset();
              window.alert('Thanks. Your interest has been saved and the team can follow up from the dashboard.');
            }}>
              <input name="name" type="text" required placeholder="Enter your full name" className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-white placeholder:text-slate-400" />
              <input name="email" type="email" required placeholder="Enter your email address" className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-white placeholder:text-slate-400" />
              <button className="w-full py-4 bg-orange-600 font-black rounded-2xl hover:bg-orange-700 shadow-xl transition-colors uppercase text-xs tracking-widest">SUBMIT</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
