
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { isSuperAdmin } from '../App';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  UserPlus, 
  ChevronLeft, 
  TrendingUp, 
  Activity, 
  Trash2, 
  Crown,
  ShieldAlert
} from 'lucide-react';

interface Props {
  user: User;
  onBack: () => void;
}

const AdminPanel: React.FC<Props> = ({ user, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('users');

  // ENFORCE STRICT ACCESS GUARD - Now checking against razakhan.chino@gmail.com
  if (!isSuperAdmin(user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-10 text-center">
        <div className="bg-red-600/20 p-8 rounded-[3rem] border border-red-500/30 mb-8 animate-pulse">
           <ShieldAlert size={80} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Access Denied</h1>
        <p className="text-slate-500 max-w-xs mx-auto font-bold text-sm leading-relaxed mb-10">This console is restricted to the Super Administrator. Unauthorized access attempts are logged.</p>
        <button onClick={onBack} className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest">Return Safely</button>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await db.admin.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const togglePremium = async (u: User) => {
    const updatedStatus = !u.premium;
    setUsers(users.map(item => item.id === u.id ? { ...item, premium: updatedStatus } : item));
    await db.admin.updateUserStatus(u.id, { premium: updatedStatus });
  };

  const toggleAdmin = async (u: User) => {
    const updatedStatus = !u.isAdmin;
    setUsers(users.map(item => item.id === u.id ? { ...item, isAdmin: updatedStatus } : item));
    await db.admin.updateUserStatus(u.id, { isAdmin: updatedStatus });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: users.length,
    premium: users.filter(u => u.premium).length,
    admins: users.filter(u => u.isAdmin).length,
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white p-6 shadow-xl sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <ShieldCheck size={24} className="text-blue-400" />
                Admin Console
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Driver Helper Management</p>
            </div>
          </div>
          <button className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            <UserPlus size={20} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          <StatCard icon={<Users size={14}/>} label="Total Drivers" value={stats.total} color="text-blue-400" />
          <StatCard icon={<Crown size={14}/>} label="Premium" value={stats.premium} color="text-amber-400" />
          <StatCard icon={<Activity size={14}/>} label="Admins" value={stats.admins} color="text-emerald-400" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="mb-6 flex gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'stats' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Usage Analytics
          </button>
        </div>

        {activeTab === 'users' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
              />
            </div>

            <div className="space-y-3">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-24 bg-white dark:bg-slate-900 animate-pulse rounded-2xl border border-slate-100 dark:border-slate-800" />)
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <div key={u.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800">
                          <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight flex items-center gap-2">
                            {u.name}
                            {u.isAdmin && <ShieldCheck size={14} className="text-blue-500" />}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 truncate max-w-[150px]">{u.email || u.language || 'English'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => togglePremium(u)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${u.premium ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30' : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}
                        >
                          {u.premium ? 'Premium' : 'Free'}
                        </button>
                        <button 
                          onClick={() => toggleAdmin(u)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${u.isAdmin ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30' : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}
                        >
                          {u.isAdmin ? 'Admin' : 'User'}
                        </button>
                        <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-30">
                   <Users size={64} className="mx-auto mb-4" />
                   <p className="font-black uppercase tracking-widest text-sm">No drivers found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl text-center">
             <TrendingUp size={64} className="mx-auto text-blue-500 mb-6" />
             <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Insights coming soon</h3>
             <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Analytics for road patterns, income surges, and driver behavior are currently being computed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
    <div className="flex items-center gap-2 mb-1">
      <div className={color}>{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </div>
    <p className="text-xl font-black tabular-nums">{value}</p>
  </div>
);

export default AdminPanel;
