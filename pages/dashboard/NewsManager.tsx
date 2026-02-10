
import React, { useState, useEffect } from 'react';
import { getNews, addNews, updateNews, deleteNews } from '../../services/mockData';
import { NewsPost } from '../../types';
import { COLORS } from '../../constants';

const NewsManager: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<NewsPost>>({});

  useEffect(() => {
    setNews([...getNews()]);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (editingId === 'new') {
      const newPost: NewsPost = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        author: 'Portal Admin',
        tags: formData.tags || [],
        category: formData.category || 'Announcement',
        image: formData.image || 'https://placehold.co/800x600?text=News+Article'
      } as NewsPost;
      addNews(newPost);
    } else {
      updateNews(formData as NewsPost);
    }
    setNews([...getNews()]);
    setEditingId(null);
  };

  const handleEdit = (n: NewsPost) => {
    setEditingId(n.id);
    setFormData(n);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this article?')) {
      deleteNews(id);
      setNews([...getNews()]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>News & Media CMS</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage public impact stories and updates</p>
        </div>
        <button 
          onClick={() => { setEditingId('new'); setFormData({}); }}
          className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all text-[10px] uppercase tracking-widest"
        >
          New Post
        </button>
      </div>

      {editingId && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tighter">Edit Article</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Article Title</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 font-bold" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500" 
                    value={formData.category || 'Announcement'}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Event">Event</option>
                    <option value="Impact Story">Impact Story</option>
                    <option value="Update">Update</option>
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Post Image</label>
                   <label className="w-full bg-orange-600 text-white rounded-2xl px-6 py-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-orange-700 transition-all font-black text-[10px] uppercase tracking-widest">
                      <i className="fas fa-upload"></i> {formData.image ? 'Replace Image' : 'Select Photo'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </label>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Image Preview</label>
               <div className="flex-grow bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden flex items-center justify-center relative">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-image text-4xl text-slate-200"></i>
                  )}
               </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Article Content</label>
              <textarea 
                rows={8}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-orange-500 text-slate-600 leading-relaxed" 
                value={formData.content || ''} 
                onChange={e => setFormData({...formData, content: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button onClick={handleSave} className="px-10 py-4 bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-orange-700">Save Article</button>
            <button onClick={() => setEditingId(null)} className="px-10 py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200">Discard</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Article Title</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {news.map(n => (
              <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                     <img src={n.image} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                     <p className="font-bold text-slate-900 truncate max-w-xs">{n.title}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200">{n.category}</span>
                </td>
                <td className="px-8 py-6 text-xs text-slate-500 font-bold">{n.date}</td>
                <td className="px-8 py-6 text-right space-x-4">
                   <button onClick={() => handleEdit(n)} className="text-slate-400 hover:text-blue-600"><i className="fas fa-edit"></i></button>
                   <button onClick={() => handleDelete(n.id)} className="text-slate-400 hover:text-red-600"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsManager;
