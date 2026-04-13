
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockNews } from '../services/mockData';
import { COLORS } from '../constants';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = mockNews.find((n) => n.id === id);

  // Get related news (excluding current)
  const relatedNews = mockNews
    .filter((n) => n.id !== id && (n.category === post?.category || n.tags.some(t => post?.tags.includes(t))))
    .slice(0, 3);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!post) {
      navigate('/news');
    }
  }, [post, navigate]);

  if (!post) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* Article Header / Hero */}
      <div className="relative h-[500px] w-full">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/60 flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-16 w-full">
            <Link to="/news" className="text-white/80 hover:text-white mb-6 inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all">
              <i className="fas fa-arrow-left"></i> Back to News
            </Link>
            <div className="flex gap-3 mb-6">
              <span className="px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                {post.category}
              </span>
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">
                {post.date}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter max-w-4xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-100">
               <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">
                 {post.author.charAt(0)}
               </div>
               <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Written By</p>
                 <p className="font-bold text-slate-900 text-lg">{post.author}</p>
               </div>
               <div className="ml-auto flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100">
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-sky-400 transition-colors border border-slate-100">
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-green-500 transition-colors border border-slate-100">
                    <i className="fab fa-whatsapp"></i>
                  </button>
               </div>
            </div>

            <article className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
               <p className="text-xl font-medium text-slate-900 mb-10 leading-relaxed italic border-l-4 pl-8" style={{ borderColor: COLORS.secondary }}>
                  {post.summary}
               </p>
               
               {/* Splitting content by newlines to render as paragraphs */}
               {post.content.split('\n').map((para, i) => (
                 <p key={i} className="mb-6">
                   {para}
                 </p>
               ))}

               <div className="mt-16 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter" style={{ color: COLORS.primary }}>Why this matters</h3>
                  <p className="text-slate-600 text-sm italic">
                    Stories like these are made possible by the unwavering support of our global community. Every update we share is a testament to the collective effort of donors, volunteers, and local partners working in synergy to empower the Munyole community.
                  </p>
               </div>
            </article>

            <div className="mt-12 pt-12 border-t border-slate-100 flex flex-wrap gap-3">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">Tags:</span>
               {post.tags.map(tag => (
                 <Link key={tag} to={`/news?search=${tag}`} className="px-4 py-2 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100 hover:bg-orange-50 hover:text-orange-600 transition-all">
                   #{tag}
                 </Link>
               ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            {/* Search Input in Sidebar */}
            <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white">
               <h4 className="text-lg font-black mb-6 uppercase tracking-widest">Newsletter</h4>
               <p className="text-slate-400 text-xs mb-8 leading-relaxed">Get the latest impact stories and news directly to your inbox every month.</p>
               <div className="space-y-4">
                  <input type="email" placeholder="Enter your email address" className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-4 outline-none focus:border-orange-500 text-sm" />
                  <button className="w-full py-4 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-orange-700 transition-all">
                    Subscribe
                  </button>
               </div>
            </div>

            {/* Related News */}
            <div>
               <h4 className="text-xl font-black mb-8 uppercase tracking-tighter" style={{ color: COLORS.primary }}>Related Stories</h4>
               <div className="space-y-8">
                  {relatedNews.length > 0 ? relatedNews.map(rn => (
                    <Link key={rn.id} to={`/news/${rn.id}`} className="flex gap-4 group">
                       <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm">
                          <img src={rn.image} alt={rn.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       </div>
                       <div className="flex flex-col justify-center">
                          <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">{rn.category}</p>
                          <h5 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">{rn.title}</h5>
                       </div>
                    </Link>
                  )) : (
                    <p className="text-slate-400 text-sm italic">No related stories available at the moment.</p>
                  )}
               </div>
            </div>

            {/* Support CTA Card */}
            <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
               <div className="w-16 h-16 mx-auto bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-2xl mb-6">
                  <i className="fas fa-hand-holding-heart"></i>
               </div>
               <h4 className="text-xl font-black mb-4" style={{ color: COLORS.primary }}>Make an Impact</h4>
               <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Your donation could fund our next success story. Be part of the change.
               </p>
               <Link to="/campaigns" className="block w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all">
                  Donate Now
               </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Recommended at Bottom */}
      <section className="bg-slate-50 py-24 border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-16">
               <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>More from Naanghirisa</h2>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Explore our latest news</p>
               </div>
               <Link to="/news" className="text-xs font-black text-orange-600 uppercase tracking-widest hover:underline">
                  View Newsroom &rarr;
               </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               {mockNews.slice(0, 3).map(n => (
                 <Link key={n.id} to={`/news/${n.id}`} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{n.date}</p>
                    <h4 className="text-xl font-black text-slate-900 mb-4 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                       {n.title}
                    </h4>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                       {n.summary}
                    </p>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       Read More <i className="fas fa-arrow-right text-[8px] group-hover:translate-x-2 transition-transform"></i>
                    </span>
                 </Link>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default NewsDetail;
