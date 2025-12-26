
import React, { useState, useRef } from 'react';
import { User, ViewType } from '../types';
import { db } from '../services/db';
import { isSuperAdmin, SUPER_ADMIN_PIN } from '../App';
import { 
  Shield, 
  Sparkles, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Star, 
  Camera, 
  Globe,
  Bell,
  Database,
  Check,
  Moon,
  Sun,
  ShieldAlert,
  X,
  Lock
} from 'lucide-react';
import { t } from '../constants';

interface Props {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onNavigate?: (view: ViewType) => void;
}

const INDIAN_LANGUAGES = [
  'English', 'Hindi (हिन्दी)', 'Bengali (বাংলা)', 'Marathi (मराठी)', 'Telugu (తెలుగు)', 
  'Tamil (தமிழ்)', 'Gujarati (ગુજરાતી)', 'Urdu (اردو)', 'Kannada (कನ್ನಡ)', 
  'Odia (ଓଡ଼ିଆ)', 'Malayalam (മലയാളം)', 'Punjabi (ਪੰਜਾਬੀ)', 'Assamese (অসমীয়া)', 
  'Maithili (मैथिली)', 'Santali (संताली)', 'Kashmiri (کأशُر)', 'Nepali (नेपाली)'
];

const Profile: React.FC<Props> = ({ user, onUpdate, onNavigate }) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lang = user.language;

  const isDarkMode = user.theme === 'dark';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageSelect = (selectedLang: string) => {
    onUpdate({ ...user, language: selectedLang });
    setShowLanguageModal(false);
  };

  const toggleTheme = () => {
    onUpdate({ ...user, theme: isDarkMode ? 'light' : 'dark' });
  };

  const handleAdminClick = () => {
    setPin('');
    setPinError(false);
    setShowPinModal(true);
  };

  const handlePinSubmit = () => {
    if (pin === SUPER_ADMIN_PIN) {
      setShowPinModal(false);
      onNavigate?.('admin');
    } else {
      setPinError(true);
      setPin('');
    }
  };

  return (
    <div className="p-4 space-y-6 md:p-8 md:space-y-8 md:max-w-3xl md:mx-auto">
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden transition-colors">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden ring-4 ring-blue-50/50 dark:ring-blue-900/20">
              <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full border-2 border-white dark:border-slate-900 shadow-lg"><Camera size={14} /></button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{user.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isSuperAdmin(user) ? 'System Administrator' : t('professional_driver', lang)}
              </span>
              <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                <Star size={10} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">4.98</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRICT ADMIN PANEL ENTRY POINT - PIN PROTECTED */}
      {isSuperAdmin(user) && (
        <section className="bg-blue-600 rounded-[2.5rem] shadow-xl overflow-hidden border-4 border-white dark:border-slate-800">
          <MenuItem 
            icon={<ShieldAlert className="text-white" />} 
            label="Open Admin Console" 
            subLabel="Security Verification Required"
            lang={lang}
            onClick={handleAdminClick}
            rightElement={<ChevronRight className="text-white/50" />}
            customStyle="text-white hover:bg-white/10"
          />
        </section>
      )}

      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          <MenuItem icon={<Sparkles className="text-purple-500" />} label={t('subscription', lang)} subLabel={user.premium ? "Premium Active" : t('premium_unlock', lang)} onClick={() => setShowSubscriptionModal(true)} lang={lang} />
          <MenuItem icon={<Bell className={notificationsEnabled ? "text-amber-500" : "text-slate-300 dark:text-slate-600"} />} label={t('notifications', lang)} lang={lang} rightElement={
            <button onClick={(e) => { e.stopPropagation(); setNotificationsEnabled(!notificationsEnabled); }} className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          }/>
          <MenuItem icon={<Database className="text-emerald-500" />} label={t('backup_restore', lang)} subLabel={t('sync_cloud', lang)} lang={lang} />
          <MenuItem icon={<Shield className="text-indigo-500" />} label={t('privacy_security', lang)} lang={lang} />
          
          <MenuItem 
            icon={isDarkMode ? <Moon className="text-blue-400" /> : <Sun className="text-orange-500" />} 
            label={t('theme', lang)} 
            subLabel={isDarkMode ? "Dark Mode Active" : "Light Mode Active"}
            lang={lang} 
            rightElement={
              <button onClick={(e) => { e.stopPropagation(); toggleTheme(); }} className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            }
          />

          <MenuItem icon={<HelpCircle className="text-orange-500" />} label={t('support_center', lang)} lang={lang} />
          <MenuItem icon={<Globe className="text-blue-500" />} label={t('language', lang)} subLabel={user.language} onClick={() => setShowLanguageModal(true)} lang={lang} />
        </div>
      </section>

      <div className="space-y-4 pb-8">
        <button onClick={() => db.user.logout().then(() => window.location.reload())} className="w-full flex items-center justify-center gap-3 py-5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black rounded-3xl uppercase text-sm tracking-widest border border-red-100 dark:border-red-900/20">
          <LogOut size={22} />
          {t('sign_out', lang)}
        </button>
      </div>

      {/* PIN ENTRY MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] p-10 shadow-3xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="bg-blue-600 p-3 rounded-2xl text-white">
                <Lock size={24} />
              </div>
              <button onClick={() => setShowPinModal(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            
            <div className="text-center mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Admin Security</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Enter 4-digit PIN</p>
            </div>

            <div className="space-y-8">
              <input 
                type="password" 
                maxLength={4}
                autoFocus
                placeholder="••••"
                className={`w-full text-center text-4xl font-black tracking-[1em] py-6 bg-slate-50 dark:bg-slate-800 border-2 rounded-[2rem] outline-none transition-all ${pinError ? 'border-red-500 text-red-500' : 'border-slate-100 dark:border-slate-700 focus:border-blue-500 text-slate-900 dark:text-white'}`}
                value={pin}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setPin(val);
                  if (val.length === 4) {
                    setTimeout(() => {
                      if (val === SUPER_ADMIN_PIN) {
                        setShowPinModal(false);
                        onNavigate?.('admin');
                      } else {
                        setPinError(true);
                        setPin('');
                      }
                    }, 300);
                  }
                }}
              />
              {pinError && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest">Incorrect PIN Access Denied</p>}
              
              <button onClick={handlePinSubmit} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30">Verify Identity</button>
            </div>
          </div>
        </div>
      )}

      {showLanguageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('language', lang)}</h3>
              <button onClick={() => setShowLanguageModal(false)} className="text-slate-400 font-black uppercase text-xs tracking-widest">{t('cancel', lang)}</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto py-4 px-6 no-scrollbar grid grid-cols-1 gap-2">
              {INDIAN_LANGUAGES.map((l) => (
                <button key={l} onClick={() => handleLanguageSelect(l)} className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${user.language === l ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <span className={`font-black uppercase tracking-tight text-sm ${user.language === l ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{l}</span>
                  {user.language === l && <Check size={20} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; subLabel?: string; onClick?: () => void; rightElement?: React.ReactNode; lang: string; customStyle?: string }> = ({ icon, label, subLabel, onClick, rightElement, customStyle }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group ${customStyle}`}>
    <div className="flex items-center gap-5">
      <div className={`p-3 rounded-2xl group-hover:shadow-lg transition-all ${customStyle ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700'}`}>{icon}</div>
      <div>
        <span className={`font-black uppercase tracking-tight transition-colors ${customStyle ? 'text-white' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{label}</span>
        {subLabel && <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 block ${customStyle ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>{subLabel}</span>}
      </div>
    </div>
    {rightElement ? rightElement : <ChevronRight size={22} className="text-slate-300 dark:text-slate-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />}
  </button>
);

export default Profile;
