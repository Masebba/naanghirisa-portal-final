
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockPrograms } from '../services/mockData';
import { COLORS } from '../constants';

const ProgramDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const program = mockPrograms.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!program) {
      navigate('/programs');
    }
  }, [program, navigate]);

  if (!program) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* Detail Header */}
      <div className="relative h-[400px]">
        <img src={program.image} alt={program.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center">
          <div className="max-w-4xl px-4">
            <Link to="/programs" className="text-white/80 hover:text-white mb-6 inline-block font-bold text-sm uppercase tracking-widest">
              <i className="fas fa-arrow-left mr-2"></i> Back to Programs
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{program.name}</h1>
            <div className="flex justify-center gap-4">
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-slate-900`}>
                Status: {program.status}
              </span>
              <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500 text-white">
                Type: {program.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-black mb-6" style={{ color: COLORS.primary }}>Overview</h2>
              <p className="text-slate-600 text-lg leading-relaxed">{program.longDescription}</p>
            </section>

            <section className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
              <h2 className="text-2xl font-black mb-6" style={{ color: COLORS.primary }}>Our Impact</h2>
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm shrink-0" style={{ color: COLORS.secondary }}>
                  <i className="fas fa-chart-line"></i>
                </div>
                <p className="text-slate-700 font-medium text-lg leading-relaxed">{program.impact}</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black mb-6" style={{ color: COLORS.primary }}>Program Goals</h2>
              <div className="grid gap-4">
                {program.goals.map((goal, idx) => (
                  <div key={idx} className="flex gap-4 items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ backgroundColor: COLORS.secondary }}>
                      {idx + 1}
                    </div>
                    <span className="text-slate-700 font-bold">{goal}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Final CTA section at the end of detailed info */}
            <section className="py-12 border-t border-slate-100">
              <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <i className="fas fa-hand-holding-heart text-9xl"></i>
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-4">Support This Mission</h3>
                  <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                    Your contribution directly supports the {program.name}. Every dollar makes a tangible difference in the lives of our community members.
                  </p>
                  <Link 
                    to={`/donate?program=${program.id}`}
                    className="inline-block px-12 py-5 bg-orange-600 text-white font-black rounded-full hover:bg-orange-700 transition-all hover:scale-105 shadow-2xl"
                  >
                    Donate to this program
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-xl">
              <h4 className="text-xl font-black mb-4">Quick Facts</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Financial Allocation</p>
                  <p className="text-2xl font-black" style={{ color: COLORS.secondary }}>${program.allocatedBudget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Operational Area</p>
                  <p className="text-lg font-bold">HQ District & Surrounding Sub-counties</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Program Type</p>
                  <p className="text-lg font-bold">{program.type}</p>
                </div>
              </div>
              <Link to={`/donate?program=${program.id}`} className="block w-full text-center py-4 bg-orange-600 text-white font-black rounded-2xl mt-8 hover:bg-orange-700 transition-colors">
                Support this Program
              </Link>
            </div>

            <div className="p-8 rounded-[2.5rem] border-2 border-slate-100 bg-white">
              <h4 className="text-xl font-black mb-4" style={{ color: COLORS.primary }}>Contact Coordinator</h4>
              <div className="flex items-center gap-4 mb-6">
                <img src="https://i.pravatar.cc/150?u=james" alt="Coordinator" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-bold text-slate-900">James Okello</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">Programs Head</p>
                </div>
              </div>
              <button className="w-full py-4 border-2 font-black rounded-2xl transition-all hover:bg-slate-50" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
                Enquire Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
