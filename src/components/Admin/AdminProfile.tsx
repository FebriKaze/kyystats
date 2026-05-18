import React, { useState, useEffect } from 'react';
import { showToast } from '../Common/Toast';
import { supabase } from '../../lib/supabase';
import { Mail, Phone, MapPin, Briefcase, Info, Lock, Check, Loader2, Camera, Instagram, Twitter, Linkedin } from 'lucide-react';
import ProfileAvatar from '../Common/ProfileAvatar';

const AdminProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOtherWorkField, setIsOtherWorkField] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    work_field: '',
    job: '',
    position: '',
    bio: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: ''
  });

  const [password, setPassword] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setProfile(prev => ({ ...prev, email: user.email || '' }));

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(prev => ({
          ...prev,
          ...data,
          instagram_url: data.instagram_url ?? '',
          twitter_url: data.twitter_url ?? '',
          linkedin_url: data.linkedin_url ?? ''
        }));
        const standardFields = ['Data Analytics', 'Software Engineering', 'UI/UX Design', 'Marketing'];
        if (data.work_field && !standardFields.includes(data.work_field)) {
          setIsOtherWorkField(true);
        }
      }
    }
    setLoading(false);
  };

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: publicUrl });
      showToast('success', 'Photo uploaded successfully!');
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        ...profile,
        updated_at: new Date()
      });
      if (error) throw error;
      showToast('success', 'Profile updated successfully!');
    } catch (err: any) {
      showToast('error', 'Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
        showToast('warning', 'New passwords do not match!');
        return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ 
        password: password.new 
    });
    if (error) {
        showToast('error', error.message);
    } else {
        showToast('success', 'Password changed successfully!');
        setPassword({ old: '', new: '', confirm: '' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans text-slate-800">
      <div className="border-b border-slate-200 pb-6 font-sans">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-xs mt-1">Home / Settings / Profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        <div className="lg:col-span-2 space-y-8 font-sans">
           <div className="grid grid-cols-3 gap-4 font-sans">
              <div className="bg-white p-5 rounded-none border border-slate-200 font-sans">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Joined</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'}) : '-'}</p>
              </div>
              <div className="bg-white p-5 rounded-none border border-slate-200 font-sans">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Updated</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{user?.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'}) : '-'}</p>
              </div>
              <div className="bg-white p-5 rounded-none border border-slate-200 font-sans">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Login</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'}) : '-'}</p>
              </div>
           </div>

           <form onSubmit={updateProfile} className="bg-white p-8 rounded-none border border-slate-200 shadow-sm space-y-8 font-sans">
              <h3 className="text-base font-serif font-bold text-slate-900 border-b border-slate-100 pb-4">Profile Form</h3>
              
              <div className="space-y-4 font-sans">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Avatar</label>
                <div className="flex items-center gap-6 font-sans">
                  <div className="w-24 h-24 bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden relative group rounded-none font-sans">
                    {uploading ? (
                      <Loader2 className="animate-spin text-[#0d2137]" size={24} />
                    ) : (
                      <ProfileAvatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Profile'}
                        className="h-full w-full rounded-none"
                        iconSize={40}
                      />
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer font-sans">
                      <Camera size={20} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2 font-sans">
                    <p className="text-sm font-bold text-slate-900 font-sans">Change Profile Photo</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">Click the camera icon on the image to upload a photo. Recommended resolution is 500x500, max size 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                 <div className="space-y-2 font-sans">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Name <span className="text-[#c0392b]">*</span></label>
                    <input required value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors" />
                 </div>
                 <div className="space-y-2 font-sans">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Email <span className="text-[#c0392b]">*</span></label>
                    <input disabled value={profile.email} className="w-full bg-slate-100 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-500 cursor-not-allowed" />
                 </div>
                 <div className="space-y-2 font-sans">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Phone Number</label>
                    <input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors" />
                 </div>
                 <div className="space-y-2 font-sans">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">City</label>
                    <input value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors" />
                 </div>
                 <div className="col-span-2 space-y-2 font-sans">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Address</label>
                    <textarea rows={2} value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 resize-none focus:outline-none focus:border-[#0d2137] transition-colors" />
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-200 space-y-6 font-sans">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                    <div className="space-y-2 font-sans">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">Field of Work</label>
                        {!isOtherWorkField ? (
                          <select 
                            value={profile.work_field} 
                            onChange={(e) => {
                              if (e.target.value === 'Other') {
                                setIsOtherWorkField(true);
                                setProfile({...profile, work_field: ''});
                              } else {
                                setProfile({...profile, work_field: e.target.value});
                              }
                            }} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#0d2137] transition-colors outline-none"
                          >
                              <option value="">Select Field</option>
                              <option value="Data Analytics">Data Analytics</option>
                              <option value="Software Engineering">Software Engineering</option>
                              <option value="UI/UX Design">UI/UX Design</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Other">Other...</option>
                          </select>
                        ) : (
                          <div className="relative font-sans">
                            <input 
                              autoFocus 
                              value={profile.work_field} 
                              onChange={(e) => setProfile({...profile, work_field: e.target.value})} 
                              placeholder="Enter field of work..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 pr-16 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors"
                            />
                            <button 
                              type="button" 
                              onClick={() => setIsOtherWorkField(false)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#c0392b] hover:underline"
                            >
                              CANCEL
                            </button>
                          </div>
                        )}
                    </div>
                    <div className="space-y-2 font-sans">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Job</label>
                        <input value={profile.job} onChange={(e) => setProfile({...profile, job: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors" />
                    </div>
                    <div className="space-y-2 font-sans">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Position</label>
                        <input value={profile.position} onChange={(e) => setProfile({...profile, position: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors" />
                    </div>
                 </div>
                 <div className="space-y-2 font-sans">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Bio</label>
                    <textarea rows={4} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors" />
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-200 space-y-4 font-sans">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Social Media Links</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Displayed on public author profile pages. Use complete URLs (e.g. https://instagram.com/username).
                </p>
                <div className="grid grid-cols-1 gap-4 font-sans">
                  <div className="space-y-2 font-sans">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
                      <Instagram size={16} className="text-[#c0392b] shrink-0" /> Instagram
                    </label>
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://www.instagram.com/username"
                      value={profile.instagram_url}
                      onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors"
                    />
                  </div>
                  <div className="space-y-2 font-sans">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
                      <Twitter size={16} className="text-[#0d2137] shrink-0" /> Twitter / X
                    </label>
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://twitter.com/username or https://x.com/username"
                      value={profile.twitter_url}
                      onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors"
                    />
                  </div>
                  <div className="space-y-2 font-sans">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
                      <Linkedin size={16} className="text-[#0d2137] shrink-0" /> LinkedIn
                    </label>
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://www.linkedin.com/in/username"
                      value={profile.linkedin_url}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-3 font-sans">
                <button type="button" className="px-6 py-3 border border-slate-200 bg-slate-50 rounded-none text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors">Reset</button>
                <button type="submit" disabled={loading} className="bg-[#0d2137] text-white px-8 py-3 rounded-none font-bold text-xs uppercase tracking-wider hover:bg-slate-900 transition-colors border border-[#0d2137] flex items-center gap-2 shadow-sm">
                   {loading && <Loader2 className="animate-spin" size={16} />} UPDATE PROFILE
                </button>
              </div>
           </form>
        </div>

        <div className="space-y-8 font-sans">
           <form onSubmit={updatePassword} className="bg-white p-8 rounded-none border border-slate-200 shadow-sm space-y-6 font-sans">
              <h3 className="text-base font-serif font-bold text-slate-900 border-b border-slate-100 pb-4">Change Password</h3>
              
              <div className="space-y-2 font-sans">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">New Password <span className="text-[#c0392b]">*</span></label>
                  <input 
                    type="password" 
                    required 
                    value={password.new} 
                    onChange={(e) => setPassword({...password, new: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137]" 
                  />
              </div>
              <div className="space-y-2 font-sans">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">Confirm Password <span className="text-[#c0392b]">*</span></label>
                  <input 
                    type="password" 
                    required 
                    value={password.confirm} 
                    onChange={(e) => setPassword({...password, confirm: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-none py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-[#0d2137]" 
                  />
              </div>

              <div className="pt-4 flex flex-col gap-3 font-sans">
                 <button type="submit" className="w-full bg-[#0d2137] text-white py-3 rounded-none font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-slate-900 transition-colors border border-[#0d2137]">UPDATE PASSWORD</button>
                 <button type="button" onClick={() => setPassword({old:'', new:'', confirm:''})} className="w-full bg-slate-100 text-slate-700 py-3 rounded-none font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors border border-slate-200 font-sans">Cancel</button>
              </div>
           </form>

           <div className="bg-[#0d2137] p-8 rounded-none border border-[#0d2137] text-white shadow-sm relative overflow-hidden font-sans">
              <div className="absolute -right-2.5 -top-2.5 opacity-10">
                <Lock size={120} />
              </div>
              <h4 className="text-lg font-serif font-bold text-slate-100">Account Security</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">Ensure your password is strong and unique. We recommend changing your password regularly every 3 months for optimal security.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
