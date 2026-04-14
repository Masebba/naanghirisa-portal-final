import React, { useEffect, useMemo, useState } from 'react';
import { addContactMessage, getFeedback, subscribeStoreUpdates, updateFeedbackMessage } from '../../services/mockData';
import { COLORS } from '../../constants';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

const FeedbackManager: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user?.role as UserRole);
  const [messages, setMessages] = useState(getFeedback());
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [formData, setFormData] = useState({ subject: 'General Member Inquiry', message: '' });

  useEffect(() => subscribeStoreUpdates(() => setMessages(getFeedback())), []);

  const summary = useMemo(() => ({ total: messages.length, unread: messages.filter(m => (m.status || 'New') === 'New').length }), [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;
    addContactMessage({
      name: user?.name || 'Member',
      email: user?.email || '',
      message: formData.message.trim(),
      category: formData.subject,
      sender: user?.name || 'Member',
      subject: formData.subject,
    } as any);
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 1200);
    setFormData({ ...formData, message: '' });
    alert('Your feedback has been logged directly with our leadership team. Thank you for your engagement.');
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>Member Support Hub</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Have a question or a story to share? We're listening.</p>
        </div>

        <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden">
           <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Topic / Department</label>
                 <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                    <option>General Member Inquiry</option>
                    <option>Donation & Receipt Issue</option>
                    <option>Impact Story Submission</option>
                    <option>Project Suggestion</option>
                    <option>Volunteer Experience Feedback</option>
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Message</label>
                 <textarea rows={6} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-medium leading-relaxed" placeholder="Describe your thoughts or query in detail..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <button type="submit" disabled={feedbackSent} className="w-full py-6 bg-orange-600 text-white font-black rounded-3xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-3 uppercase text-xs tracking-widest disabled:opacity-50">
                 {feedbackSent ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Submit Feedback</>}
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Organisation Inbox</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Review feedback from donors, volunteers and community</p>
        </div>
        <div className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div>{summary.total} total</div>
          <div>{summary.unread} new</div>
        </div>
      </div>

      <div className="grid gap-6">
        {messages.map(msg => (
          <div key={msg.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-start gap-8 group hover:shadow-xl transition-all">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${msg.status === 'New' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-400'}`}>
                <i className={msg.status === 'New' ? 'fas fa-envelope' : 'fas fa-envelope-open'}></i>
             </div>
             <div className="flex-grow">
                <div className="flex justify-between items-center mb-3">
                   <h4 className="text-xl font-black text-slate-900">{msg.subject || msg.category || 'Feedback message'}</h4>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.date}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">"{msg.message}"</p>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{(msg.sender || msg.name || 'M').charAt(0)}</div>
                      <span className="text-sm font-bold text-slate-700">{msg.sender || msg.name || msg.email || 'Anonymous'}</span>
                   </div>
                   <div className="flex gap-3">
                      <button onClick={() => updateFeedbackMessage(msg.id, { status: 'Reviewed' })} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest">Reviewed</button>
                      <button onClick={() => updateFeedbackMessage(msg.id, { status: 'Archived' })} className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest">Archive</button>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackManager;
