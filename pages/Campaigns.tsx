import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCampaigns,
  getDonations,
  getPageContent,
} from "../services/mockData";
import { COLORS } from "../constants";

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"All" | "Active" | "Closed">("All");
  const [visibleCount, setVisibleCount] = useState(6);

  const campaigns = getCampaigns();
  const donations = getDonations();
  const pageContent = getPageContent();

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => filter === "All" || c.status === filter);
  }, [campaigns, filter]);

  const displayedCampaigns = filteredCampaigns.slice(0, visibleCount);
  const hasCampaigns = displayedCampaigns.length > 0;

  const totalRaised = campaigns.reduce(
    (sum, item) => sum + item.amountRaised,
    0,
  );
  const activeCampaigns = campaigns.filter(
    (item) => item.status === "Active",
  ).length;
  const closedCampaigns = campaigns.filter(
    (item) => item.status === "Closed",
  ).length;
  const totalTargets = campaigns.reduce(
    (sum, item) => sum + item.targetAmount,
    0,
  );
  const overallProgress =
    totalTargets > 0
      ? Math.min(100, Math.round((totalRaised / totalTargets) * 100))
      : 0;

  const recentSupport = donations.slice(0, 4);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const handleDonate = (campaignId: string) => {
    navigate(`/donate?campaign=${campaignId}`);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="py-24 text-center text-white bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">
            Support Our Mission
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
            Your contributions directly fuel our community initiatives. Every
            gift strengthens a child, a family, and a future.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 text-center">
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
            <p className="text-3xl font-black text-orange-500 mb-1">
              ${totalRaised.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Total Raised
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
            <p className="text-3xl font-black text-orange-500 mb-1">
              {activeCampaigns}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Active Campaigns
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
            <p className="text-3xl font-black text-orange-500 mb-1">
              {overallProgress}%
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Portfolio Progress
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
            <p className="text-3xl font-black text-orange-500 mb-1">
              {closedCampaigns}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Completed
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {["All", "Active", "Closed"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f as any);
                setVisibleCount(6);
              }}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                filter === f
                  ? "bg-orange-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {f === "All" ? "All Campaigns" : `${f} Campaigns`}
            </button>
          ))}
        </div>

        {hasCampaigns ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
              {displayedCampaigns.map((camp) => {
                const progress =
                  camp.targetAmount > 0
                    ? (camp.amountRaised / camp.targetAmount) * 100
                    : 0;
                const isClosed = camp.status === "Closed";

                return (
                  <div
                    key={camp.id}
                    className={`bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col group transition-all duration-500 ${isClosed ? "grayscale opacity-75" : "hover:shadow-2xl"}`}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={camp.image}
                        alt={camp.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg ${isClosed ? "bg-slate-800 text-white" : "bg-emerald-600 text-white"}`}
                        >
                          {camp.status}
                        </span>
                      </div>
                      {isClosed && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                          <span className="text-white font-black text-lg uppercase tracking-widest border-2 border-white px-6 py-2 rounded-full">
                            Completed
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-10 flex flex-col flex-grow">
                      <h3
                        className="text-2xl font-black mb-3 line-clamp-1"
                        style={{ color: COLORS.primary }}
                      >
                        {camp.name}
                      </h3>
                      <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-3 font-medium">
                        {camp.purpose}
                      </p>

                      <div className="mb-10">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                          <span>{Math.round(progress)}% Funded</span>
                          <span>
                            Goal: ${camp.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${isClosed ? "bg-slate-400" : "bg-orange-500"}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="mt-2 text-right">
                          <span
                            className="text-xs font-black"
                            style={{
                              color: isClosed ? "#64748b" : COLORS.secondary,
                            }}
                          >
                            ${camp.amountRaised.toLocaleString()} Raised
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 mt-auto">
                        <Link
                          to={`/campaigns/${camp.id}`}
                          className="w-full text-center py-4 bg-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
                        >
                          Read More
                        </Link>
                        {!isClosed && (
                          <button
                            onClick={() => handleDonate(camp.id)}
                            className="w-full py-4 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-orange-100"
                            style={{ backgroundColor: COLORS.secondary }}
                          >
                            Donate to this Campaign
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredCampaigns.length && (
              <div className="text-center mb-24">
                <button
                  onClick={handleLoadMore}
                  className="px-12 py-4 border-2 font-black text-xs uppercase tracking-widest rounded-full transition-all hover:bg-slate-50"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                >
                  Load More Campaigns
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mb-20 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
            <h2
              className="text-3xl font-black mb-4"
              style={{ color: COLORS.primary }}
            >
              No campaigns available yet
            </h2>
            <p className="max-w-2xl mx-auto text-slate-500 leading-relaxed">
              Campaigns will appear here once the team creates them in the
              dashboard. Until then, donations can still be received through the
              main donation page and assigned to future initiatives.
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <Link
                to="/donate"
                className="px-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl"
                style={{ backgroundColor: COLORS.secondary }}
              >
                Donate Now
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-black uppercase tracking-widest text-[10px]"
              >
                Admin Setup
              </Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-16 items-center py-20 border-t border-slate-100">
          <div>
            <h2
              className="text-4xl font-black mb-6 uppercase tracking-tighter"
              style={{ color: COLORS.primary }}
            >
              Your Trust Is Our Legacy
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-10">
              We track donations, campaign progress, and spending with a
              transparency-first workflow so supporters can follow real
              outcomes.
            </p>
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-sm">
                  <i className="fas fa-shield-alt" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1">
                    Secure Transactions
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Donations are captured through the portal and tracked in the
                    ledger for review.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-sm">
                  <i className="fas fa-file-invoice-dollar" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1">
                    Direct Program Funding
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Funds flow into defined campaigns and program allocations
                    based on organisational priorities.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-sm">
                  <i className="fas fa-search-dollar" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1">
                    Real-Time Reporting
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Recent donations update campaign progress immediately inside
                    the portal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[4rem] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <i className="fas fa-award text-9xl" />
            </div>
            <h3 className="text-3xl font-black mb-8">Recent Support</h3>
            {recentSupport.length > 0 ? (
              <div className="space-y-4">
                {recentSupport.map((donation, idx) => (
                  <div
                    key={donation.id}
                    className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-black">
                        {donation.donorName?.[0] || "N"}
                      </div>
                      <span className="text-sm font-bold">
                        {donation.donorName || "Supporter"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-black text-sm">
                        ${donation.amount.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                        {donation.category ||
                          donation.campaignId ||
                          `Gift #${idx + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Recent donations will appear here once supporters start
                  contributing through the portal.
                </p>
              </div>
            )}
            <p className="mt-8 text-xs text-slate-500 font-bold text-center uppercase tracking-widest italic">
              "Join the list of change-makers today"
            </p>
          </div>
        </div>

        <div className="mt-24 text-center max-w-4xl mx-auto">
          <h2
            className="text-3xl font-black mb-12"
            style={{ color: COLORS.primary }}
          >
            Fundraising FAQs
          </h2>
          <div className="grid gap-4 text-left">
            {[
              {
                q: "Is my donation tax-deductible?",
                a: "Yes, Naanghirisa is a registered Community Based Organisation. We provide tax receipts for all contributions.",
              },
              {
                q: "Can I donate to a specific child?",
                a: "While general campaigns support cohorts, you can use our Child Sponsorship Program to support an individual student.",
              },
              {
                q: "What happens if a campaign exceeds its goal?",
                a: "Surplus funds are allocated to the next most urgent community need within the same category.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-8 bg-slate-50 rounded-3xl border border-slate-100"
              >
                <h4 className="font-black text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
