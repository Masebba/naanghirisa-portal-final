
import React, { useState, useEffect } from 'react';
import { getPrograms, addProgram, updateProgram, deleteProgram } from '../../services/mockData';
import { Program } from '../../types';
import { COLORS } from '../../constants';

const ProgramsManager: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Program>>({});

  useEffect(() => {
    setPrograms([...getPrograms()]);
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
      const newProgram: Program = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'Running',
        type: 'Annual',
        allocatedBudget: Number(formData.allocatedBudget) || 0,
        goals: [],
        impact: '',
        longDescription: formData.description || '',
        image: formData.image || 'https://placehold.co/800x600?text=New+Program'
      } as Program;
      addProgram(newProgram);
    } else {
      updateProgram(formData as Program);
    }
    setPrograms([...getPrograms()]);
    setEditingId(null);
  };

  const handleEdit = (p: Program) => {
    setEditingId(p.id);
    setFormData(p);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      deleteProgram(id);
      setPrograms([...getPrograms()]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black" style={{ color: COLORS.primary }}>Manage Programs</h2>
        <button 
          onClick={() => { setEditingId('new'); setFormData({}); }}
          className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all text-sm uppercase tracking-widest"
        >
          Add New Program
        </button>
      </div>

      {editingId && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tighter">{editingId === 'new' ? 'Create Program' : 'Edit Program'}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Program Title</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Allocated Budget ($)</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 font-bold" 
                    value={formData.allocatedBudget || ''} 
                    onChange={e => setFormData({...formData, allocatedBudget: Number(e.target.value)})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Summary</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 leading-relaxed" 
                    value={formData.description || ''} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
               </div>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Featured Program Image</label>
                  <div className="relative group">
                    <div className="w-full h-64 bg-slate-100 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center relative">
                      {formData.image ? (
                        <img src={formData.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-slate-400">
                           <i className="fas fa-image text-5xl mb-4"></i>
                           <p className="text-[10px] font-black uppercase tracking-widest">No Image Selected</p>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <span className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest">
                           <i className="fas fa-upload mr-2"></i> Replace Image
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
               </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button onClick={handleSave} className="px-10 py-4 bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-orange-700 shadow-xl shadow-orange-100">Save Changes</button>
            <button onClick={() => setEditingId(null)} className="px-10 py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200">Discard</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Program Identity</th>
              <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Frequency</th>
              <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Budget Status</th>
              <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {programs.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    <p className="font-black text-slate-900">{p.name}</p>
                  </div>
                </td>
                <td className="px-10 py-6">
                   <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200">{p.type}</span>
                </td>
                <td className="px-10 py-6 font-black text-orange-600">${p.allocatedBudget.toLocaleString()}</td>
                <td className="px-10 py-6 text-right space-x-4">
                  <button onClick={() => handleEdit(p)} className="text-slate-400 hover:text-blue-600"><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-600"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramsManager;
