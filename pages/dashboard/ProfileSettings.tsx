import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../../constants';
import { notify } from '../../services/notifications';
import { authService } from '../../services/authService';
import { uploadImageFile } from '../../services/imageUpload';
import { User } from '../../types';

const ProfileSettings: React.FC = () => {
  const initialUser = authService.getCurrentUser();
  const [profileData, setProfileData] = useState<Partial<User>>({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    avatar: initialUser?.avatar || '',
    phone: initialUser?.phone || '',
    location: initialUser?.location || '',
    workDetails: initialUser?.workDetails || '',
  });
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!initialUser) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest">Session expired. Please log in again.</p>
        <Link to="/login" className="mt-4 inline-block text-orange-600 font-black">Go to Login</Link>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file);
      setProfileData({ ...profileData, avatar: url });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Image upload failed.');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavingProfile(true);
    try {
      await authService.updateCurrentUser({
        ...initialUser,
        ...profileData,
        id: initialUser.id,
        role: initialUser.role,
        email: initialUser.email,
      } as User);
      setProfileSuccess(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!passwords.new) {
      setErrorMsg('Enter a new password first.');
      return;
    }
    if (passwords.new.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.updatePassword(passwords.new);
      setPasswords({ new: '', confirm: '' });
      setPasswordSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password.';
      setErrorMsg(message.includes('recent-login') || message.includes('requires recent login')
        ? 'Please sign out and sign back in before changing your password.'
        : message);
    } finally {
      setSavingPassword(false);
    }
  };

  const PasswordField = ({
    label,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder: string;
  }) => (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm px-2 py-1 text-slate-400 transition hover:text-slate-700"
        >
          <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: COLORS.primary }}>Personal Profile</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Update your personal details and credentials separately</p>
        </div>
        <Link to="/dashboard" className="px-4 py-2 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all">Close</Link>
      </div>

      {errorMsg && <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 font-bold text-sm"><i className="fas fa-exclamation-triangle mr-2"></i> {errorMsg}</div>}
      {profileSuccess && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 font-bold text-sm"><i className="fas fa-check mr-2"></i> Profile updated successfully.</div>}
      {passwordSuccess && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 font-bold text-sm"><i className="fas fa-check mr-2"></i> Password updated successfully.</div>}

      <form onSubmit={handleProfileSave} className="space-y-5">
        <div className="bg-white p-5 md:p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative group shrink-0 self-center lg:self-start">
              <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-lg ring-4 ring-slate-50 relative">
                {profileData.avatar ? (
                  <img src={profileData.avatar} className="w-full h-full object-cover" alt="Avatar Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-300">{profileData.name?.charAt(0)}</div>
                )}
                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm rounded-full">
                  <i className="fas fa-camera text-white text-xl"></i>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white rounded-sm text-[9px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">Change photo</button>
            </div>

            <div className="flex-grow grid md:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full legal name</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" value={profileData.name || ''} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email address</label>
                <input type="email" readOnly className="w-full bg-slate-100 border border-slate-100 rounded-lg px-4 py-3 outline-none font-bold text-slate-500" value={profileData.email || ''} title="Email is linked to your Firebase Auth account" />
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">Email is tied to authentication</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone number</label>
              <div className="relative">
                <i className="fas fa-phone-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="+256 000 000000" value={profileData.phone || ''} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Geographic location</label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="City, Country" value={profileData.location || ''} onChange={e => setProfileData({ ...profileData, location: e.target.value })} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work or professional background</label>
              <textarea rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 leading-relaxed" placeholder="Describe your current profession or affiliation with the organisation..." value={profileData.workDetails || ''} onChange={e => setProfileData({ ...profileData, workDetails: e.target.value })} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={savingProfile} className="w-full py-3 bg-orange-600 text-white font-black rounded-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 uppercase text-xs tracking-widest disabled:opacity-50">
          {savingProfile ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-cloud-upload-alt"></i> Save profile</>}
        </button>
      </form>

      <form onSubmit={handlePasswordSave} className="space-y-5">
        <div className="bg-white p-5 md:p-6 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="text-base font-black uppercase tracking-tighter mb-4 flex items-center gap-2"><i className="fas fa-shield-alt text-orange-500"></i> Security & credentials</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <PasswordField
              label="New password"
              value={passwords.new}
              onChange={value => setPasswords({ ...passwords, new: value })}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(show => !show)}
              placeholder="New password"
            />
            <PasswordField
              label="Confirm password"
              value={passwords.confirm}
              onChange={value => setPasswords({ ...passwords, confirm: value })}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(show => !show)}
              placeholder="Confirm password"
            />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">Password changes are saved separately from your profile details.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button type="submit" disabled={savingPassword} className="w-full md:w-auto px-5 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-lg disabled:opacity-50">
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
          <button type="button" onClick={() => setPasswords({ new: '', confirm: '' })} className="w-full md:w-auto px-5 py-3 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all">
            Clear password fields
          </button>
        </div>
      </form>

      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="font-black text-slate-900 uppercase tracking-tight">System identity</h4>
          <p className="text-xs text-slate-400 mt-1">Portal permission level: <span className="font-bold text-orange-600 uppercase tracking-widest">{initialUser.role.replace('_', ' ')}</span></p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => notify('Contact Super Admin to reset account metadata.')} className="px-4 py-2 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all">Reset meta</button>
          <button type="button" className="px-4 py-2 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-lg">Two-factor security</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
