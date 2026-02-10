
import React from 'react';
import { COLORS, BRAND } from '../constants';

const Contact: React.FC = () => {
   return (
      <div className="bg-white min-h-screen">
         {/* Page Header */}
         <div className="py-24 text-center text-white" style={{ backgroundColor: COLORS.primary }}>
            <div className="max-w-7xl mx-auto px-4">
               <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">Get in Touch</h1>
               <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
                  Have questions about our programs or want to partner with us? Reach out today.
               </p>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid lg:grid-cols-2 gap-20">
               <div>
                  <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter" style={{ color: COLORS.primary }}>Contact Us</h2>
                  <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                     We are here to help. Whether you're a potential donor, a volunteer, or a community member in need, our team is ready to listen and support.
                  </p>

                  <div className="space-y-10">
                     <div className="flex items-start gap-6 group">
                        <div className="w-14 h-14 bg-red-50 text-red-900 rounded-2xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-orange-50" style={{ color: COLORS.primary }}>
                           <i className="fas fa-map-marker-alt text-xl"></i>
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Our Location</h4>
                           <p className="text-slate-600 font-medium">Plot 12, Community Link Road, HQ District, Butaleja, Uganda</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-6 group">
                        <div className="w-14 h-14 bg-red-50 text-red-900 rounded-2xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-orange-50" style={{ color: COLORS.primary }}>
                           <i className="fas fa-phone text-xl"></i>
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Call Us</h4>
                           <p className="text-slate-600 font-medium">+256 757 466773<br />+256 770 000000</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-6 group">
                        <div className="w-14 h-14 bg-red-50 text-red-900 rounded-2xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-orange-50" style={{ color: COLORS.primary }}>
                           <i className="fas fa-envelope text-xl"></i>
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Email Addresses</h4>
                           <p className="text-slate-600 font-medium">info@naanghirisa.org<br />support@naanghirisa.org</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-16 p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                     <h4 className="font-black text-slate-900 mb-4">Follow Our Progress</h4>
                     <div className="flex gap-4">
                        {[
                           { icon: 'fa-facebook-f', color: 'bg-blue-600' },
                           { icon: 'fa-x-twitter', color: 'bg-sky-400' },
                           { icon: 'fa-whatsapp', color: 'bg-green-500' },
                           { icon: 'fa-instagram', color: 'bg-pink-600' }
                        ].map((social, i) => (
                           <a key={i} href="#" className={`w-12 h-12 rounded-xl text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md ${social.color}`}>
                              <i className={`fab ${social.icon}`}></i>
                           </a>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                     <i className="fas fa-paper-plane text-9xl"></i>
                  </div>

                  <h3 className="text-3xl font-black mb-8" style={{ color: COLORS.primary }}>Send a Message</h3>

                  <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! Our team will contact you soon.'); }}>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Full Name</label>
                           <input
                              required
                              type="text"
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                              placeholder="John Doe"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                           <input
                              required
                              type="email"
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                              placeholder="john@example.com"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subject</label>
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium">
                           <option>General Enquiry</option>
                           <option>Donation Information</option>
                           <option>Volunteer Opportunity</option>
                           <option>Partnership Request</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Message</label>
                        <textarea
                           required
                           rows={6}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none font-medium"
                           placeholder="Tell us how we can help..."
                        ></textarea>
                     </div>

                     <button
                        type="submit"
                        className="w-full py-5 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 hover:scale-[1.02]"
                        style={{ backgroundColor: COLORS.secondary }}
                     >
                        Send Message <i className="fas fa-arrow-right ml-2"></i>
                     </button>
                  </form>

                  <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                     We typically respond within 24-48 business hours.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Contact;
