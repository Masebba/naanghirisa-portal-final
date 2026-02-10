
import React, { useState } from 'react';
import { COLORS } from '../constants';
import { addVolunteerApplication } from '../services/mockData';

const Volunteer: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: 'Education',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVolunteerApplication(formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', interests: 'Education', message: '' });
      setIsSubmitted(false);
      alert("Application received! Our team will review your profile and contact you within 48 hours.");
    }, 1500);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover" alt="Volunteer" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center text-white">
          <span className="inline-block px-4 py-1.5 bg-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Join the Movement</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter uppercase">Volunteer with Naanghirisa</h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto font-medium mb-12">
            Your skills and passion can help transform lives in Butaleja. Be the change you want to see in the world.
          </p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-black text-orange-500">250+</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Volunteers</p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center">
              <p className="text-4xl font-black text-orange-500">12k+</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact Hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Volunteer Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="font-bold text-sm tracking-widest uppercase mb-4 block" style={{ color: COLORS.secondary }}>Opportunities</span>
            <h2 className="text-4xl font-black mb-8" style={{ color: COLORS.primary }}>How You Can Help</h2>
            <div className="space-y-8">
              {[
                { title: 'Education Support', desc: 'Assist in local schools, tutor children, or help organize scholastic distributions.', icon: 'fa-graduation-cap' },
                { title: 'Community Welfare', desc: 'Help identify vulnerable households and coordinate relief supplies.', icon: 'fa-hands-holding-heart' },
                { title: 'Skills Development', desc: 'Share your professional expertise in vocational training or IT workshops.', icon: 'fa-lightbulb' },
                { title: 'Documentation & Media', desc: 'Help us tell our story through photography, videography, and impact reporting.', icon: 'fa-camera-retro' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-xl shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all" style={{ color: COLORS.primary }}>
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="absolute -inset-4 bg-orange-500/10 rounded-[3rem] transform rotate-3"></div>
             <img 
               src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800" 
               className="relative z-10 rounded-[2.5rem] shadow-2xl border-4 border-white" 
               alt="Team" 
             />
             <div className="absolute -bottom-8 -left-8 bg-slate-900 p-8 rounded-3xl text-white shadow-2xl z-20 max-w-xs">
                <p className="text-orange-500 font-black text-2xl mb-2 italic">"Truly Rewarding"</p>
                <p className="text-xs opacity-70 leading-relaxed font-medium">
                  "Volunteering with Naanghirisa opened my eyes to the resilience of our community. I feel like I am part of a family."
                </p>
                <div className="mt-4 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-800"></div>
                   <span className="text-[10px] font-black uppercase">Sarah K. (Field Vol)</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-24 bg-slate-50" id="apply">
        <div className="max-w-4xl mx-auto px-4">
           <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-slate-100">
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter" style={{ color: COLORS.primary }}>Apply to Volunteer</h2>
                 <p className="text-slate-500 font-medium">Tell us a bit about yourself and your motivations.</p>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
                       <input 
                         required
                         type="text" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold" 
                         placeholder="John Doe"
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                       <input 
                         required
                         type="email" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold" 
                         placeholder="john@example.com"
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
                       <input 
                         required
                         type="tel" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold" 
                         placeholder="+256 ..."
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Interest Area</label>
                       <select 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                         value={formData.interests}
                         onChange={e => setFormData({...formData, interests: e.target.value})}
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Why do you want to join us?</label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium leading-relaxed" 
                      placeholder="Share your story and how you hope to contribute..."
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                 </div>

                 <button 
                   type="submit" 
                   disabled={isSubmitted}
                   className="w-full py-6 bg-orange-600 text-white font-black rounded-3xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 uppercase text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {isSubmitted ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Submit Application</>}
                 </button>
              </form>
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 max-w-4xl mx-auto px-4">
         <h3 className="text-3xl font-black mb-12 text-center uppercase tracking-tighter" style={{ color: COLORS.primary }}>Volunteer FAQ</h3>
         <div className="space-y-6">
            {[
              { q: "What is the minimum time commitment?", a: "We welcome all levels of commitment, from one-off event support to long-term weekly engagement." },
              { q: "Do I need special qualifications?", a: "Not necessarily. We need passionate individuals. However, specific roles like medical screening or IT workshops may require verification of skills." },
              { q: "Are there remote volunteering options?", a: "Yes! Our media, reporting, and fundraising teams often work remotely." }
            ].map((faq, idx) => (
              <div key={idx} className="p-8 bg-white border border-slate-100 rounded-3xl hover:border-orange-200 transition-all">
                 <h4 className="font-black text-slate-900 mb-2">{faq.q}</h4>
                 <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default Volunteer;
