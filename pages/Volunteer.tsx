import React, { useState } from 'react';
import { COLORS } from '../constants';
import { addVolunteerApplication } from '../services/mockData';

const Volunteer: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: 'Education',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVolunteerApplication(formData);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', interests: 'Education', message: '' });
  };

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1600" className="h-full w-full object-cover" alt="Volunteer" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <span className="mb-6 inline-block rounded-full bg-orange-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em]">Join the movement</span>
          <h1 className="mb-8 text-5xl font-black uppercase tracking-tight md:text-7xl">Volunteer with Naanghirisa</h1>
          <p className="mx-auto mb-12 max-w-2xl text-xl font-medium text-orange-50/80">
            Your skills and passion can help transform lives in Butaleja.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-20 px-4 py-24 lg:grid-cols-2 items-center">
        <div>
          <span className="mb-4 block text-sm font-bold uppercase tracking-widest" style={{ color: COLORS.secondary }}>Opportunities</span>
          <h2 className="mb-8 text-4xl font-black" style={{ color: COLORS.primary }}>How you can help</h2>
          <div className="space-y-8">
            {[
              { title: 'Education Support', desc: 'Assist in schools, mentor learners, and help organise scholastic distributions.', icon: 'fa-graduation-cap' },
              { title: 'Community Welfare', desc: 'Help identify vulnerable households and coordinate relief supplies.', icon: 'fa-hands-holding-heart' },
              { title: 'Skills Development', desc: 'Share expertise in vocational training, technology, or administration.', icon: 'fa-lightbulb' },
              { title: 'Documentation & Media', desc: 'Support photography, videography, and impact reporting.', icon: 'fa-camera-retro' },
            ].map((item) => (
              <div key={item.title} className="flex gap-6 group">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-xl transition group-hover:bg-orange-600 group-hover:text-white" style={{ color: COLORS.primary }}>
                  <i className={`fas ${item.icon}`} />
                </div>
                <div>
                  <h4 className="mb-1 font-black uppercase tracking-tight text-slate-900">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[3rem] bg-orange-500/10 transform rotate-3" />
          <img
            src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800"
            className="relative z-10 rounded-[2.5rem] border-4 border-white shadow-2xl"
            alt="Team"
          />
          <div className="absolute -bottom-8 -left-8 z-20 max-w-xs rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
            <p className="mb-2 text-2xl font-black italic text-orange-500">"Truly rewarding"</p>
            <p className="text-xs leading-relaxed text-white/70">
              Volunteering with Naanghirisa opened my eyes to the resilience of our community.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24" id="apply">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-2xl md:p-14">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-black uppercase tracking-tight" style={{ color: COLORS.primary }}>Apply to volunteer</h2>
              <p className="text-slate-500">Tell us a bit about yourself and your motivations.</p>
            </div>

            {isSubmitted ? (
              <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                  <i className="fas fa-check text-2xl" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Application received</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Our team will review your profile and contact you through the email or phone number you provided.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 rounded-2xl bg-slate-900 px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-black"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Full name</label>
                    <input
                      required
                      type="text"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Email address</label>
                    <input
                      required
                      type="email"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Phone number</label>
                    <input
                      required
                      type="tel"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="+256 ..."
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Interest area</label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-bold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      value={formData.interests}
                      onChange={e => setFormData({ ...formData, interests: e.target.value })}
                    >
                      <option>Education</option>
                      <option>Healthcare</option>
                      <option>Welfare</option>
                      <option>Media & Stories</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Why do you want to join us?</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 font-medium leading-relaxed outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Share your story and how you hope to contribute..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-3 rounded-3xl bg-orange-600 py-6 text-xs font-black uppercase tracking-[0.25em] text-white shadow-xl shadow-orange-100 transition hover:bg-orange-700"
                >
                  <i className="fas fa-paper-plane" />
                  Submit application
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Volunteer;
