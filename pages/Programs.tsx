
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockPrograms } from '../services/mockData';
import { COLORS } from '../constants';
import { Program } from '../types';

const Programs: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Recurrent' | 'Annual'>('All');
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredPrograms = useMemo(() => {
    return mockPrograms.filter(p => filter === 'All' || p.type === filter);
  }, [filter]);

  const displayedPrograms = filteredPrograms.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  const handleDonateClick = (programId: string) => {
    // Navigate to donate page, optionally passing program context
    navigate(`/donate?program=${programId}`);
  };

  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="py-24 text-center text-white" style={{ backgroundColor: COLORS.primary }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">Our Programs</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
            Strategic, community-led initiatives designed to foster self-reliance and empower vulnerable children.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Filter Sub-menu */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {['All', 'Recurrent', 'Annual'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f as any);
                setVisibleCount(6);
              }}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-sm ${filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              {f === 'All' ? 'All Activities' : `${f} Programs`}
            </button>
          ))}
        </div>

        {/* Programs Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayedPrograms.map((program) => (
            <div key={program.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-500">
              <div className="h-64 relative overflow-hidden">
                <img src={program.image} alt={program.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${program.status === 'Running' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                    {program.status}
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg bg-white/90 backdrop-blur-sm text-slate-900">
                    {program.type}
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-black mb-3 line-clamp-1" style={{ color: COLORS.primary }}>{program.name}</h3>
                <p className="text-slate-600 text-sm mb-8 flex-grow leading-relaxed line-clamp-3">{program.description}</p>

                <div className="flex flex-col gap-4 mt-auto">
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
                      <p className="font-black text-base" style={{ color: COLORS.secondary }}>${program.allocatedBudget.toLocaleString()}</p>
                    </div>
                    <Link
                      to={`/programs/${program.id}`}
                      className="px-5 py-2 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                      Read More
                    </Link>
                  </div>
                  <button
                    onClick={() => handleDonateClick(program.id)}
                    className="w-full py-3 bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-700 transition-all shadow-md"
                  >
                    Donate to this program
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredPrograms.length && (
          <div className="text-center mb-24">
            <button
              onClick={handleLoadMore}
              className="px-12 py-4 border-2 font-black text-xs uppercase tracking-widest rounded-full transition-all hover:bg-slate-50"
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}
            >
              Load More Programs
            </button>
          </div>
        )}

        {/* Strategic Approach Section (Maintaining existing style) */}
        <div className="mb-24 py-20 bg-slate-50 rounded-[4rem] px-8 md:px-20 border border-slate-100">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ color: COLORS.primary }}>Our Strategic Approach</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Ensuring sustainable and measurable impact</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm" style={{ color: COLORS.secondary }}>
                <i className="fas fa-search-plus"></i>
              </div>
              <h4 className="font-black text-xl mb-3" style={{ color: COLORS.primary }}>Needs Assessment</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Every program begins with rigorous community consultation to ensure we address the actual pain points.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm" style={{ color: COLORS.secondary }}>
                <i className="fas fa-project-diagram"></i>
              </div>
              <h4 className="font-black text-xl mb-3" style={{ color: COLORS.primary }}>Agile Execution</h4>
              <p className="text-slate-600 text-sm leading-relaxed">We utilize lean management principles to ensure maximum funding reaches the ground.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm" style={{ color: COLORS.secondary }}>
                <i className="fas fa-chart-bar"></i>
              </div>
              <h4 className="font-black text-xl mb-3" style={{ color: COLORS.primary }}>Impact Audits</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Regular audits ensure that our programs are meeting their defined goals for the community.</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Programs;
