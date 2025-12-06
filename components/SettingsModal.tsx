
import React, { useState, useEffect, useRef } from 'react';
import { UserState } from '../types';
import { supabase } from '../supabaseClient';
import { X, Save, User, Image as ImageIcon, Upload, Lock } from 'lucide-react';

interface SettingsModalProps {
  user: UserState;
  onUpdate: (updates: Partial<UserState>) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ user, onUpdate, onClose }) => {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`);
  }, [avatar, username]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    
    // Upload to Supabase Storage
    try {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        setAvatar(publicUrl);
    } catch (error: any) {
        alert('Error uploading avatar: ' + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const updates: any = {};
    
    // Only update username if it changed and user is allowed to
    if (username !== user.username && !user.usernameChanged) {
        updates.username = username;
        updates.username_changed = true; // Mark as changed in DB
    }
    
    if (avatar !== user.avatar) {
        updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
        setIsSaving(false);
        onClose();
        return;
    }

    // Update local immediately for responsiveness
    onUpdate({ 
        username: updates.username || user.username,
        avatar: updates.avatar || user.avatar,
        usernameChanged: updates.username_changed ? true : user.usernameChanged
    });

    // Update DB
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
        const { error } = await supabase.from('profiles').update(updates).eq('id', authUser.id);
        if (error) {
            console.error('Error updating profile:', error);
            // Revert local state if needed, or show alert
        }
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-md bg-[#151B25] border border-[#2A3441] rounded-3xl p-8 shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6 flex items-center gap-3">
            <User className="text-blox-accent" />
            Profile Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview Section */}
            <div className="flex flex-col items-center justify-center mb-6 gap-3">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className={`w-24 h-24 rounded-full bg-blox-background object-cover border-4 border-blox-accent shadow-lg shadow-yellow-500/10 ${uploading ? 'opacity-50' : ''}`} 
                    />
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white w-6 h-6" />
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                    )}
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                 />
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Click to Upload Avatar</span>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex justify-between">
                        Username
                        {user.usernameChanged && <span className="text-red-400 flex items-center gap-1"><Lock size={10}/> Locked</span>}
                    </label>
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-blox-accent transition-colors" />
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={!!user.usernameChanged}
                            className={`w-full bg-[#0B0E14] border border-[#2F2B3E] text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blox-accent focus:ring-1 focus:ring-blox-accent/50 transition-all font-medium text-sm ${user.usernameChanged ? 'opacity-50 cursor-not-allowed' : ''}`}
                            maxLength={16}
                        />
                    </div>
                    {!user.usernameChanged && (
                        <p className="text-[10px] text-yellow-500 ml-1 font-bold">Note: You can only change your username once.</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-blox-surfaceHighlight text-gray-400 hover:text-white hover:bg-[#2A3441] transition-colors"
                >
                    CANCEL
                </button>
                <button 
                    type="submit"
                    disabled={isSaving || uploading}
                    className="flex-[2] bg-blox-accent hover:bg-blox-accentHover text-blox-surface font-black py-3.5 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'SAVING...' : (
                        <>
                            <Save size={18} />
                            SAVE CHANGES
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
