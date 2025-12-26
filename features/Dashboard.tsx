
import React, { useState, useEffect } from 'react';
import { User, ViewType, CommunityPost } from '../types';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { TrendingUp, AlertCircle, Plus, Wrench, Heart, Zap, Mic, Users, MessageCircle, Heart as HeartIcon, Clock, Wallet, Cloud } from 'lucide-react';
import { t } from '../constants';

interface Props {
  user: User;
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<Props> = ({ user, onNavigate }) => {
  const [summary, setSummary] = useState({ income: 0, expenses: 0, savings: 0 });
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = user.language;

  useEffect(() => {
    fetchData();
    
    // Set up real-time listener for community updates
    const communityChannel = supabase
      .channel('public:community_posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, payload => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(communityChannel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [stats, posts] = await Promise.all([
      db.income.getSummary(),
      db.community.getPosts()
    ]);
    setSummary(stats);
    setRecentPosts(posts.slice(0, 2));
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 md:p-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Redesigned Compact Welcome Card */}
      <section className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:bg-blue-600/30 transition-all"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full -ml-24 -mb-24 blur-[60px]"></div>

        <div className="relative z-10 flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl font-black tracking-tighter md:text-4xl uppercase">{t('welcome', lang)}, {user.name}!</h2>
            <div className="flex items-center gap-2 mt-1">
              <Cloud size={12} className="text-blue-400" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] md:text-xs">Cloud Synced</p>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <Wallet size={20} className="text-blue-400" />
          </div>
        </div>
        
        {/* Real Savings UI */}
        <div className="grid grid-cols-1 gap-4 relative z-10">
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Global Savings</p>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <p className="text-4xl font-black tracking-tighter text-emerald-400">₹{summary.savings.toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10">
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{t('profit_today', lang)}</p>
              <p className="text-lg font-black mt-1 text-white">₹{summary.income.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10">
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{t('expense_today', lang)}</p>
              <p className="text-lg font-black mt-1 text-rose-400">₹{summary.expenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('quick_actions', lang)}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ActionButton onClick={() => onNavigate('income')} color="bg-emerald-500/10" textColor="text-emerald-500" icon={<Plus size={20} />} label={t('nav_earnings', lang)} />
          <ActionButton onClick={() => onNavigate('live-voice')} color="bg-blue-500/10" textColor="text-blue-500" icon={<Mic size={20} />} label={t('voice_ai', lang)} />
          <ActionButton onClick={() => onNavigate('alarms')} color="bg-indigo-500/10" textColor="text-indigo-500" icon={<Clock size={20} />} label={t('alarms', lang)} />
          <ActionButton onClick={() => onNavigate('car-check')} color="bg-orange-500/10" textColor="text-orange-500" icon={<Wrench size={20} />} label={t('car_check', lang)} />
          <ActionButton onClick={() => onNavigate('health')} color="bg-rose-500/10" textColor="text-rose-500" icon={<Heart size={20} />} label={t('health', lang)} />
          <ActionButton onClick={() => onNavigate('sos')} color="bg-red-500/10" textColor="text-red-500" icon={<AlertCircle size={20} />} label={t('nav_sos', lang)} />
        </div>
      </section>

      {/* Recent DriveHub Posts */}
      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-slate-800 text-lg flex items-center gap-3 uppercase tracking-tighter">
            <Users size={20} className="text-blue-500" />
            {t('recent_updates', lang)}
          </h3>
          <button onClick={() => onNavigate('community')} className="text-blue-600 text-[9px] font-black bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-widest border border-blue-100">{t('view_all', lang)}</button>
        </div>
        <div className="space-y-6">
          {!loading ? recentPosts.map(post => (
            <div key={post.id} className="flex gap-5 group cursor-pointer hover:translate-x-1 transition-transform" onClick={() => onNavigate('community')}>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} alt="author" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{post.author}</p>
                  <span className="text-[8px] text-slate-400 font-bold whitespace-nowrap ml-2 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-widest">{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 font-bold leading-relaxed">{post.content}</p>
              </div>
            </div>
          )) : (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded-full w-1/3"></div>
                    <div className="h-2 bg-slate-50 rounded-full w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ActionButton: React.FC<{ onClick: () => void, color: string, textColor: string, icon: React.ReactNode, label: string }> = ({ onClick, color, textColor, icon, label }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center bg-white p-4 rounded-[2.2rem] border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-xl transition-all active:scale-95 group overflow-hidden"
  >
    <div className={`${color} ${textColor} p-4 rounded-2xl group-hover:scale-110 transition-transform mb-3 shadow-inner`}>
      {icon}
    </div>
    <span className="text-[9px] font-black text-slate-600 tracking-tighter uppercase text-center leading-tight line-clamp-2 px-1">{label}</span>
  </button>
);

export default Dashboard;
