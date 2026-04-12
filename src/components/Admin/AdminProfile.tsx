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
      showToast('success', 'Foto berhasil diunggah!');
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
      showToast('success', 'Profil berhasil diperbarui!');
    } catch (err: any) {
      showToast('error', 'Gagal memperbarui profil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
        showToast('warning', 'Konfirmasi sandi baru tidak cocok!');
        return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ 
        password: password.new 
    });
    if (error) {
        showToast('error', error.message);
    } else {
        showToast('success', 'Kata sandi berhasil diganti!');
        setPassword({ old: '', new: '', confirm: '' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tighter dark:text-white">Profil Saya</h1>
        <p className="text-slate-500 dark:text-slate-400">Beranda - Pengaturan - Profil</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Profile Form */}
        <div className="lg:col-span-2 space-y-8">
           {/* Date Info Cards */}
           <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bergabung</p>
                <p className="text-sm font-bold dark:text-white mt-1">{user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : '-'}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diperbarui</p>
                <p className="text-sm font-bold dark:text-white mt-1">{user?.updated_at ? new Date(user.updated_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : '-'}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terakhir Masuk</p>
                <p className="text-sm font-bold dark:text-white mt-1">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : '-'}</p>
              </div>
           </div>

           <form onSubmit={updateProfile} className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <h3 className="text-lg font-black dark:text-white border-b border-slate-50 dark:border-slate-800 pb-4">Formulir Profil</h3>
              
              {/* Avatar Section */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Avatar</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group">
                    {uploading ? (
                      <Loader2 className="animate-spin text-primary" size={24} />
                    ) : (
                      <ProfileAvatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Profil'}
                        className="h-full w-full rounded-3xl"
                        iconSize={40}
                      />
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera size={20} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-bold dark:text-white">Ganti Foto Profil</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Klik ikon kamera pada gambar untuk mengunggah foto. Rekomendasi resolusi gambar adalah 500x500 dan maksimal ukuran 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama <span className="text-red-500">*</span></label>
                    <input required value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white focus:ring-2 focus:ring-primary/20 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email <span className="text-red-500">*</span></label>
                    <input disabled value={profile.email} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nomor Telepon</label>
                    <input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Kota</label>
                    <input value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white" />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Alamat</label>
                    <textarea rows={2} value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white resize-none" />
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Bidang Pekerjaan</label>
                        {!isOtherWorkField ? (
                          <select 
                            value={profile.work_field} 
                            onChange={(e) => {
                              if (e.target.value === 'Lainnya') {
                                setIsOtherWorkField(true);
                                setProfile({...profile, work_field: ''});
                              } else {
                                setProfile({...profile, work_field: e.target.value});
                              }
                            }} 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white font-bold"
                          >
                              <option value="">Pilih Bidang</option>
                              <option value="Data Analytics">Data Analytics</option>
                              <option value="Software Engineering">Software Engineering</option>
                              <option value="UI/UX Design">UI/UX Design</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Lainnya">Lainnya...</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <input 
                              autoFocus 
                              value={profile.work_field} 
                              onChange={(e) => setProfile({...profile, work_field: e.target.value})} 
                              placeholder="Masukkan bidang pekerjaan..."
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white"
                            />
                            <button 
                              type="button" 
                              onClick={() => setIsOtherWorkField(false)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary hover:underline"
                            >
                              BATAL
                            </button>
                          </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Pekerjaan</label>
                        <input value={profile.job} onChange={(e) => setProfile({...profile, job: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Jabatan</label>
                        <input value={profile.position} onChange={(e) => setProfile({...profile, position: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Bio</label>
                    <textarea rows={4} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white" />
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Tautan media sosial</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed -mt-2">
                  Tampil di halaman profil publik penulis. Gunakan URL lengkap (mis. https://instagram.com/username).
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                      <Instagram size={14} className="text-primary shrink-0" /> Instagram
                    </label>
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://www.instagram.com/username"
                      value={profile.instagram_url}
                      onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                      <Twitter size={14} className="text-primary shrink-0" /> Twitter / X
                    </label>
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://twitter.com/username atau https://x.com/username"
                      value={profile.twitter_url}
                      onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                      <Linkedin size={14} className="text-primary shrink-0" /> LinkedIn
                    </label>
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://www.linkedin.com/in/username"
                      value={profile.linkedin_url}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-3">
                <button type="button" className="px-8 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Reset</button>
                <button type="submit" disabled={loading} className="bg-primary text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex items-center gap-2">
                   {loading && <Loader2 className="animate-spin" size={16} />} PERBARUI PROFIL
                </button>
              </div>
           </form>
        </div>

        {/* Right Sidebar: Change Password */}
        <div className="space-y-8">
           <form onSubmit={updatePassword} className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-black dark:text-white border-b border-slate-50 dark:border-slate-800 pb-4">Ganti Sandi</h3>
              
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Sandi Baru <span className="text-red-500">*</span></label>
                  <input 
                    type="password" 
                    required 
                    value={password.new} 
                    onChange={(e) => setPassword({...password, new: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white" 
                  />
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Konfirmasi Sandi <span className="text-red-500">*</span></label>
                  <input 
                    type="password" 
                    required 
                    value={password.confirm} 
                    onChange={(e) => setPassword({...password, confirm: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm dark:text-white" 
                  />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                 <button type="submit" className="w-full bg-primary text-white py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20">PERBARUI SANDI</button>
                 <button type="button" onClick={() => setPassword({old:'', new:'', confirm:''})} className="w-full bg-slate-50 dark:bg-slate-800 text-slate-500 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Batalkan</button>
              </div>
           </form>

           {/* Informational Widget */}
           <div className="bg-blue-600 p-8 rounded-4xl text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
              <div className="absolute -right-2.5 -top-2.5 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Lock size={120} />
              </div>
              <h4 className="text-xl font-black tracking-tight leading-tight">Keamanan Akun</h4>
              <p className="text-xs opacity-70 mt-2 leading-relaxed">Pastikan kata sandi anda kuat dan unik. Kami merekomendasikan penggantian sandi secara berkala setiap 3 bulan.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
