import React, { useEffect, useMemo, useState } from 'react';
import { COLORS } from '../../constants';
import { notify } from '../../services/notifications';
import { authService } from '../../services/authService';
import { addContactMessage, deleteFeedbackMessage, getFeedback, subscribeStoreUpdates, updateFeedbackMessage } from '../../services/mockData';
import { UserRole } from '../../types';

const perPage = 6;

const FeedbackManager: React.FC = () => {
  const user = authService.getCurrentUser();
  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(user?.role as UserRole);
  const [messages, setMessages] = useState(getFeedback());
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [formData, setFormData] = useState({ subject: 'General Member Inquiry', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Reviewed' | 'Archived'>('All');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => subscribeStoreUpdates(() => setMessages(getFeedback())), []);

  const summary = useMemo(() => ({ total: messages.length, unread: messages.filter(m => (m.status || 'New') === 'New').length }), [messages]);

  const filteredMessages = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return messages.filter(msg => {
      const text = `${msg.subject || msg.category || ''} ${msg.message || ''} ${msg.sender || msg.name || msg.email || ''}`.toLowerCase();
      const status = msg.status || 'New';
      const matchesSearch = !term || text.includes(term);
      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / perPage));
  const pagedMessages = filteredMessages.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

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
      replyTo: user?.email || '',
    } as any);
    setFeedbackSent(true);
    window.setTimeout(() => setFeedbackSent(false), 1200);
    setFormData({ ...formData, message: '' });
  };

  const handleAction = async (id: string, action: 'Reviewed' | 'Archived' | 'Delete') => {
    setBusyId(id);
    try {
      if (action === 'Delete') {
        deleteFeedbackMessage(id);
      } else {
        updateFeedbackMessage(id, { status: action, reviewedAt: new Date().toISOString(), reviewedBy: user?.name || 'Administration' } as any);
      }
    } finally {
      setBusyId(null);
    }
  };

  const openReply = (msg: any) => {
    const targetEmail = msg.replyTo || msg.email;
    if (!targetEmail) {
      notify('This message has no email address attached.');
      return;
    }
    const subject = `Re: ${msg.subject || msg.category || 'Your message'}`;
    const body = `Hello ${msg.name || msg.sender || 'there'},\n\nThank you for reaching out to Naanghirisa.\n\n`;
    window.open(`mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>Member Support Hub</h2>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-400">Have a question or a story to share? We&apos;re listening.</p>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <form className="relative z-10 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Topic / Department</label>
              <select className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                <option>General Member Inquiry</option>
                <option>Donation & Receipt Issue</option>
                <option>Impact Story Submission</option>
                <option>Project Suggestion</option>
                <option>Volunteer Experience Feedback</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Your Message</label>
              <textarea rows={5} required className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 font-medium leading-relaxed outline-none focus:ring-2 focus:ring-orange-500" placeholder="Describe your thoughts or query in detail..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
            </div>
            <button type="submit" disabled={feedbackSent} className="flex w-full items-center justify-center gap-3 rounded-lg bg-orange-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 disabled:opacity-50">
              {feedbackSent ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-paper-plane" /> Submit feedback</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Organisation Inbox</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Review, reply to, or remove feedback from the platform</p>
        </div>
        <div className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div>{summary.total} total</div>
          <div>{summary.unread} new</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'New', 'Reviewed', 'Archived'].map(status => (
            <button key={status} type="button" onClick={() => { setStatusFilter(status as any); setPage(1); }} className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}`}>
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="Search messages"
            className="w-full rounded-lg border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {pagedMessages.length > 0 ? pagedMessages.map(msg => {
          const status = msg.status || 'New';
          return (
            <div key={msg.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg shadow-inner ${status === 'New' ? 'border border-orange-100 bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                    <i className={status === 'New' ? 'fas fa-envelope' : 'fas fa-envelope-open'} />
                  </div>
                  <div className="max-w-3xl space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-black text-slate-900">{msg.subject || msg.category || 'Feedback message'}</h4>
                      <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">{msg.date}</span>
                      <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${status === 'New' ? 'bg-orange-50 text-orange-600' : status === 'Reviewed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{status}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{msg.message}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                      <span className="rounded-full bg-slate-50 px-3 py-1">{msg.sender || msg.name || msg.email || 'Anonymous'}</span>
                      {msg.email && <span className="rounded-full bg-slate-50 px-3 py-1">{msg.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button type="button" onClick={() => handleAction(msg.id, 'Reviewed')} disabled={busyId === msg.id} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 disabled:opacity-50">Review</button>
                  <button type="button" onClick={() => handleAction(msg.id, 'Archived')} disabled={busyId === msg.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-50">Archive</button>
                  <button type="button" onClick={() => openReply(msg)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-700">Reply</button>
                  <button type="button" onClick={() => { if (confirm('Delete this message permanently?')) void handleAction(msg.id, 'Delete'); }} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700">Delete</button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
            <i className="fas fa-inbox mb-3 text-3xl" />
            <p className="text-xs font-black uppercase tracking-widest">No messages match this filter</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-40">Previous</button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const n = index + 1;
              return (
                <button key={n} type="button" onClick={() => setPage(n)} className={`min-w-9 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest ${page === n ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{n}</button>
              );
            })}
          </div>
          <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default FeedbackManager;
