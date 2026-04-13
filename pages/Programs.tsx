import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockPrograms } from "../services/mockData";
import { COLORS } from "../constants";
import { Program } from "../types";

const Programs: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"All" | "Recurrent" | "Annual">("All");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredPrograms = useMemo(() => {
    return mockPrograms.filter((p) => filter === "All" || p.type === filter);
  }, [filter]);

  const displayedPrograms = filteredPrograms.slice(0, visibleCount);
  const hasPrograms = displayedPrograms.length > 0;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const handleDonateClick = (programId: string) => {
    // Navigate to donate page, optionally passing program context
    navigate(`/donate?program=${programId}`);
  };

  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="py-24 text-center text-white bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">
            Our Programs
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
            Strategic, community-led initiatives designed to foster
            self-reliance and empower vulnerable children.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Filter Sub-menu */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {["All", "Recurrent", "Annual"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f as any);
                setVisibleCount(6);
              }}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                filter === f
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {f === "All" ? "All Activities" : `${f} Programs`}
            </button>
          ))}
        </div>

        {hasPrograms ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {displayedPrograms.map((program) => (
              <div
                key={program.id}
                className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-lg ${program.status === "Running" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}
                    >
                      {program.status}
                    </span>
                    <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-lg backdrop-blur-sm">
                      {program.type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-grow flex-col p-8">
                  <h3
                    className="mb-3 text-xl font-black line-clamp-1"
                    style={{ color: COLORS.primary }}
                  >
                    {program.name}
                  </h3>
                  <p className="mb-8 flex-grow text-sm leading-relaxed text-slate-600 line-clamp-3">
                    {program.description}
                  </p>
                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Budget
                        </p>
                        <p
                          className="text-base font-black"
                          style={{ color: COLORS.secondary }}
                        >
                          ${program.allocatedBudget.toLocaleString()}
                        </p>
                      </div>
                      <Link
                        to={`/programs/${program.id}`}
                        className="rounded-xl bg-slate-100 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 transition hover:bg-slate-200"
                      >
                        Read more
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDonateClick(program.id)}
                      className="w-full rounded-xl bg-orange-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-md transition hover:bg-orange-700"
                    >
                      Donate to this program
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-16 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
            <i className="fas fa-box-open mb-6 text-5xl text-slate-300"></i>
            <h3 className="text-2xl font-black text-slate-900">
              No programmes published yet
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
              Programmes added in the dashboard will appear here automatically.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredPrograms.length && (
          <div className="mb-24 text-center">
            <button
              onClick={handleLoadMore}
              className="rounded-full border-2 px-12 py-4 text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-50"
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}
            >
              Load more programmes
            </button>
          </div>
        )}

        {/* Strategic Approach Section (Maintaining existing style) */}
        <div className="mb-24 py-20 bg-slate-50 rounded-[4rem] px-8 md:px-20 border border-slate-100">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-black mb-4"
              style={{ color: COLORS.primary }}
            >
              Our Strategic Approach
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
              Ensuring sustainable and measurable impact
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm"
                style={{ color: COLORS.secondary }}
              >
                <i className="fas fa-search-plus"></i>
              </div>
              <h4
                className="font-black text-xl mb-3"
                style={{ color: COLORS.primary }}
              >
                Needs Assessment
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every program begins with rigorous community consultation to
                ensure we address the actual pain points.
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm"
                style={{ color: COLORS.secondary }}
              >
                <i className="fas fa-project-diagram"></i>
              </div>
              <h4
                className="font-black text-xl mb-3"
                style={{ color: COLORS.primary }}
              >
                Agile Execution
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                We utilize lean management principles to ensure maximum funding
                reaches the ground.
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-sm"
                style={{ color: COLORS.secondary }}
              >
                <i className="fas fa-chart-bar"></i>
              </div>
              <h4
                className="font-black text-xl mb-3"
                style={{ color: COLORS.primary }}
              >
                Impact Audits
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Regular audits ensure that our programs are meeting their
                defined goals for the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programs;
