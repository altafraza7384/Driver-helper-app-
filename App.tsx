
import React, { useState, useEffect } from 'react';
import { User, ViewType, AppNotification, Alarm } from './types';
import { NAV_ITEMS, t } from './constants';
import { db } from './services/db';
import { supabase, isSupabaseConfigured } from './services/supabase';
import Dashboard from './features/Dashboard';
import IncomeTracker from './features/IncomeTracker';
import SOSHub from './features/SOSHub';
import AIAssistant from './features/AIAssistant';
import Community from './features/Community';
import Profile from './features/Profile';
import CarCheckPage from './features/CarCheck';
import HealthTracker from './features/HealthTracker';
import NotesManager from './features/NotesManager';
import NotificationCenter from './features/NotificationCenter';
import LiveVoiceAssistant from './features/LiveVoiceAssistant';
import AlarmManager from './features/AlarmManager';
import AdminPanel from './features/AdminPanel';
import { Bell, UserCircle, CloudSync, Lock, Mail, Key } from 'lucide-react';

// SECURE SUPER ADMIN CHECK - Updated with correct email
export const SUPER_ADMIN_EMAIL = 'razakhan.chino@gmail.com';
export const SUPER_ADMIN_PIN = '1234'; // Your 4-digit PIN
export const isSuperAdmin = (u: User | null) => u?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize App Data
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      const savedUser = await db.user.get();
      if (savedUser) {
        setUser(savedUser);
        const savedNotifs = await db.notifications.getAll();
        setNotifications(savedNotifs);
      }
      setLoading(false);
    };
    initApp();

    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN') {
          const u = await db.user.get();
          setUser(u);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      return () => authListener.subscription.unsubscribe();
    }
  }, []);

  const updateUser = async (updatedUser: User) => {
    setIsSyncing(true);
    await db.user.save(updatedUser);
    setUser(updatedUser);
    setIsSyncing(false);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await db.notifications.saveAll(updated);
  };

  const deleteNotification = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    await db.notifications.saveAll(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Initializing Helper...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onUserReady={setUser} />;
  }

  const lang = user.language;
  const isDarkMode = user.theme === 'dark';

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex flex-col min-h-screen">
        {/* Top Header */}
        {activeView !== 'sos' && activeView !== 'live-voice' && activeView !== 'admin' && (
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20">
                <UserCircle size={20} />
              </div>
              <div>
                <span className="font-black text-slate-800 dark:text-white text-lg tracking-tighter">DriverHelper</span>
                {isSyncing && (
                  <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 animate-pulse">
                    <CloudSync size={10} /> Syncing
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveView('notifications')} className="relative text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2">
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div onClick={() => setActiveView('profile')} className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-all">
                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 pb-24 overflow-y-auto no-scrollbar max-w-4xl mx-auto w-full">
          {activeView === 'dashboard' && <Dashboard user={user} onNavigate={setActiveView} />}
          {activeView === 'income' && <IncomeTracker user={user} />}
          {activeView === 'sos' && <SOSHub user={user} onBack={() => setActiveView('dashboard')} />}
          {activeView === 'ai' && <AIAssistant user={user} onNavigate={setActiveView} />}
          {activeView === 'community' && <Community user={user} />}
          {activeView === 'profile' && <Profile user={user} onUpdate={updateUser} onNavigate={setActiveView} />}
          {activeView === 'car-check' && <CarCheckPage user={user} onBack={() => setActiveView('dashboard')} />}
          {activeView === 'health' && <HealthTracker user={user} onBack={() => setActiveView('dashboard')} />}
          {activeView === 'notes' && <NotesManager user={user} />}
          {activeView === 'alarms' && <AlarmManager user={user} onBack={() => setActiveView('dashboard')} />}
          {activeView === 'notifications' && <NotificationCenter user={user} notifications={notifications} onBack={() => setActiveView('dashboard')} onMarkRead={markAllAsRead} onDelete={deleteNotification} />}
          {activeView === 'live-voice' && <LiveVoiceAssistant user={user} onClose={() => setActiveView('dashboard')} />}
          {activeView === 'admin' && <AdminPanel user={user} onBack={() => setActiveView('profile')} />}
        </main>

        {activeView !== 'live-voice' && activeView !== 'alarms' && activeView !== 'admin' && (
          <nav className="fixed bottom-4 left-4 right-4 bg-slate-900/95 dark:bg-slate-900/98 backdrop-blur-xl px-4 py-3 flex justify-around items-center shadow-2xl z-40 max-w-4xl mx-auto rounded-[2.5rem] border border-white/10">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewType)} className={`flex flex-col items-center gap-1 min-w-[50px] transition-all duration-300 ${activeView === item.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <div className={`transition-all duration-300 ${activeView === item.id ? 'translate-y-[-4px] scale-110' : ''}`}>{item.icon}</div>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-all ${activeView === item.id ? 'opacity-100' : 'opacity-50'}`}>{t(item.labelKey, lang)}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

const AuthScreen: React.FC<{ onUserReady: (u: User) => void }> = ({ onUserReady }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    
    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        const isAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        const demoUser: User = { 
          id: 'demo-' + Date.now(), 
          name: name || 'Driver', 
          email: email.toLowerCase(), 
          language: 'English', 
          premium: isAdmin, 
          theme: 'light', 
          isAdmin: isAdmin 
        };
        db.user.save(demoUser);
        onUserReady(demoUser);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.toLowerCase(), password, options: { data: { name } } });
        if (error) throw error;
        if (data.user) {
          const isAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
          const newUser: User = { 
            id: data.user.id, 
            name: name || 'Driver', 
            email: email.toLowerCase(), 
            language: 'English', 
            premium: isAdmin, 
            theme: 'light', 
            isAdmin: isAdmin 
          };
          await db.user.save(newUser);
          onUserReady(newUser);
        }
      }
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Offline mode activated - No cloud sync" : err.message);
      if (err.message === "Failed to fetch") {
        const isAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        const demoUser: User = { 
          id: 'offline-' + Date.now(), 
          name: name || 'Driver', 
          email: email.toLowerCase(), 
          language: 'English', 
          premium: isAdmin, 
          theme: 'light', 
          isAdmin: isAdmin 
        };
        db.user.save(demoUser);
        onUserReady(demoUser);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-6 text-center">
      <div className="bg-blue-600 p-6 rounded-[3rem] mb-10 shadow-3xl shadow-blue-500/20 animate-in zoom-in duration-700">
        <Lock size={80} className="text-white" />
      </div>
      <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">Driver Helper</h1>
      <p className="text-slate-500 mb-8 max-w-xs font-bold uppercase text-[10px] tracking-[0.3em]">Access Your Road Companion</p>
      
      <div className="w-full max-w-sm space-y-4">
        {!isLogin && (
          <div className="relative">
            <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input type="text" placeholder="YOUR FULL NAME" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-900 border-2 border-slate-800 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all font-black uppercase text-sm tracking-widest" />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-900 border-2 border-slate-800 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all font-black uppercase text-sm tracking-widest" />
        </div>
        <div className="relative">
          <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-900 border-2 border-slate-800 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-all font-black uppercase text-sm tracking-widest" />
        </div>

        {error && <p className="text-red-500 text-[10px] font-black uppercase bg-red-500/10 py-2 rounded-xl border border-red-500/20">{error}</p>}

        <button onClick={handleAuth} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/30 uppercase tracking-[0.2em] text-xs disabled:opacity-50">
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>

        <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 font-black uppercase text-[9px] tracking-[0.2em] pt-4">
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
};

export default App;
