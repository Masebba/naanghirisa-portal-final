
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPageContent, mockNews, subscribeStoreUpdates } from '../services/mockData';
import { authService } from '../services/authService';
import { COLORS } from '../constants';
import { UserRole } from '../types';

const News: React.FC = () => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = !!currentUser && [UserRole.SUPER_ADMIN, UserRole.MID_ADMIN, UserRole.STAFF_ADMIN].includes(currentUser.role);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageContent, setPageContent] = useState(getPageContent());

  useEffect(() => subscribeStoreUpdates(() => setPageContent(getPageContent())), []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(6);

  const categories = ['All', 'Announcement', 'Event', 'Impact Story', 'Update'];

  const filteredNews = useMemo(() => {
    return mockNews.filter((post) => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const displayedNews = filteredNews.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      window.alert(`Deleting post ${id}. In a production deployment this would call the CMS API.`);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="py-24 text-center text-white" style={{ backgroundColor: COLORS.primary, backgroundImage: pageContent.newsHeroImage ? `linear-gradient(rgba(88,0,0,0.82), rgba(88,0,0,0.82)), url(${pageContent.newsHeroImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">News & Announcements</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto font-medium">
            Stay updated with our latest activities, stories of impact, and upcoming community events.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-16 items-center justify-between">
          <div className="relative w-full md:w-96">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search news, tags, or topics..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(6);
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredNews.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
             <i className="fas fa-newspaper text-6xl text-slate-200 mb-6"></i>
             <h3 className="text-xl font-black text-slate-400">No news articles found matching your criteria.</h3>
             <button 
               onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
               className="mt-6 text-orange-500 font-bold hover:underline"
             >
               Clear all filters
             </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {displayedNews.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-500 relative"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                       <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-full shadow-lg">
                         {post.category}
                       </span>
                    </div>
                    
                    {/* Admin Actions Overlay */}
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           title="Edit Post"
                           className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-all"
                         >
                            <i className="fas fa-edit"></i>
                         </button>
                         <button 
                           onClick={() => handleDelete(post.id)}
                           title="Delete Post"
                           className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white transition-all"
                         >
                            <i className="fas fa-trash"></i>
                         </button>
                      </div>
                    )}
                  </div>

                  <div className="p-10 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                       <span className="flex items-center gap-1"><i className="far fa-calendar"></i> {post.date}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                       <span className="flex items-center gap-1"><i className="far fa-user"></i> {post.author}</span>
                    </div>

                    <h3 className="text-2xl font-black mb-4 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors" style={{ color: COLORS.primary }}>
                       {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-3">
                       {post.summary}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex flex-wrap gap-2 mb-6">
                       {post.tags.map(tag => (
                         <span key={tag} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                           #{tag}
                         </span>
                       ))}
                    </div>

                    <Link 
                      to={`/news/${post.id}`}
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 hover:text-orange-600 transition-all"
                    >
                       Read Full Story <i className="fas fa-arrow-right text-[10px]"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredNews.length && (
              <div className="text-center mt-20">
                <button 
                  onClick={handleLoadMore}
                  className="px-12 py-4 border-2 font-black text-xs uppercase tracking-widest rounded-full transition-all hover:bg-slate-50"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                >
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}

        {/* Newsletter / Subscription Section */}
        <div className="mt-32 p-12 md:p-20 bg-slate-950 rounded-[4rem] text-white relative overflow-hidden">
           <div className="absolute bottom-0 right-0 p-10 opacity-5">
              <i className="fas fa-paper-plane text-[15rem] rotate-12"></i>
           </div>
           <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter leading-none">Subscribe for Weekly Updates</h2>
                 <p className="text-slate-400 text-lg leading-relaxed">
                   Never miss a story. Join our community of 2,000+ supporters and get our latest impact reports and news delivered to your inbox.
                 </p>
              </div>
              <div>
                 <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
                    <input 
                      type="email" 
                      required
                      placeholder="Enter your email address" 
                      className="flex-grow bg-white/5 border border-white/20 rounded-2xl px-6 py-5 outline-none focus:border-orange-500 text-white placeholder:text-slate-600"
                    />
                    <button className="px-10 py-5 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl">
                       SUBSCRIBE
                    </button>
                 </form>
                 <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    We respect your privacy. Unsubscribe at any time.
                 </p>
              </div>
           </div>
        </div>

        {/* Media Contact Section */}
        <div className="mt-32 text-center max-w-3xl mx-auto">
           <h3 className="text-2xl font-black mb-6" style={{ color: COLORS.primary }}>Media Enquiries</h3>
           <p className="text-slate-500 mb-8 leading-relaxed">
             Are you a journalist or researcher looking for more information about Naanghirisa's work? 
             Please reach out to our communications department for press kits, high-res photos, and interview requests.
           </p>
           <a 
             href="mailto:press@naanghirisa.org"
             className="inline-flex items-center gap-3 px-8 py-3 bg-slate-50 text-slate-900 border border-slate-200 font-black rounded-xl hover:bg-white hover:border-orange-500 transition-all text-xs uppercase tracking-widest"
           >
              <i className="fas fa-envelope text-orange-500"></i> Contact Press Team
           </a>
        </div>
      </div>
    </div>
  );
};

export default News;
