import React, { useState, useRef } from 'react';
import { authService } from '../../services/authService';
import { COLORS } from '../../constants';
import { User } from '../../types';
import { Link } from 'react-router-dom';
import { uploadImageFile } from '../../services/imageUpload';

const ProfileSettings: React.FC = () => {
  const initialUser = authService.getCurrentUser();
  const [formData, setFormData] = useState<Partial<User>>({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    avatar: initialUser?.avatar || '',
    phone: initialUser?.phone || '',
    location: initialUser?.location || '',
    workDetails: initialUser?.workDetails || ''
  });

  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!initialUser) return (
    <div className="p-20 text-center">
      <p className="text-slate-400 font-bold uppercase tracking-widest">Session expired. Please log in again.</p>
      <Link to="/login" className="mt-4 inline-block text-orange-600 font-black">Go to Login</Link>
    </div>
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file);
      setFormData({ ...formData, avatar: url });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Image upload failed.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (passwords.new && passwords.new !== passwords.confirm) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      if (passwords.new) {
        await authService.updatePassword(passwords.new);
      }

      const updatedUser: User = {
        ...initialUser,
        ...formData,
        id: initialUser.id,
        role: initialUser.role,
      } as User;

      await authService.updateCurrentUser(updatedUser);
      setIsSuccess(true);
      setPasswords({ new: '', confirm: '' });
    } catch (err) {
      console.error('Profile Save Failed:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-8 shadow-inner ring-8 ring-emerald-50/50">
          <i className="fas fa-check"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Profile updated successfully</h2>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-10">Member credentials and portfolio synced.</p>
        <div className="flex gap-4">
          <button onClick={() => setIsSuccess(false)} className="px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all">Return to Profile</button>
          <Link to="/dashboard" className="px-10 py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>Personal Portfolio</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Update your personal details and professional credentials</p>
        </div>
        <Link to="/dashboard" className="px-6 py-2.5 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">Cancel</Link>
      </div>

      {errorMsg && <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold text-sm animate-in shake-in"><i className="fas fa-exclamation-triangle mr-2"></i> {errorMsg}</div>}

      <form onSubmit={handleSave} className="space-y-10">
        <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[3rem] bg-slate-100 overflow-hidden border-4 border-white shadow-2xl ring-8 ring-slate-50 relative">
                  {formData.avatar ? (
                    <img src={formData.avatar} className="w-full h-full object-cover" alt="Avatar Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-300">{formData.name?.charAt(0)}</div>
                  )}
                  <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm">
                    <i className="fas fa-camera text-white text-2xl"></i>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl whitespace-nowrap">Change Photo</button>
              </div>

              <div className="flex-grow grid md:grid-cols-2 gap-8 w-full">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Legal Name</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                  <input type="email" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 border-t border-slate-100 pt-12">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
                <div className="relative">
                  <i className="fas fa-phone-alt absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="+256 000 000000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Geographic Location</label>
                <div className="relative">
                  <i className="fas fa-map-marker-alt absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="City, Country" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Work or Professional Background</label>
                <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 leading-relaxed" placeholder="Describe your current profession or affiliation with the organisation..." value={formData.workDetails} onChange={e => setFormData({ ...formData, workDetails: e.target.value })} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-12">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3"><i className="fas fa-shield-alt text-orange-500"></i> Security & Credentials</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">New Password</label>
                  <input type="password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="New password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Confirm New Password</label>
                  <input type="password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="Confirm new password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h4 className="font-black text-slate-900 uppercase tracking-tight">System Identity</h4>
            <p className="text-xs text-slate-400 mt-1">Portal Permission Level: <span className="font-bold text-orange-600 uppercase tracking-widest">{initialUser.role.replace('_', ' ')}</span></p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => alert('Contact Super Admin to reset account metadata.')} className="px-8 py-3 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">Reset Meta</button>
            <button type="button" className="px-8 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg">Two-Factor Security</button>
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="w-full py-6 bg-orange-600 text-white font-black rounded-[2.5rem] hover:bg-orange-700 transition-all shadow-2xl shadow-orange-100 flex items-center justify-center gap-3 uppercase text-xs tracking-widest disabled:opacity-50">
          {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-cloud-upload-alt"></i> Save All Profile Changes</>}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
