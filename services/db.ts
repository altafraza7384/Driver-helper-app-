
import { User, IncomeRecord, Note, Alarm, CommunityPost, AppNotification } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * DATABASE SERVICE (HYBRID CLOUD/LOCAL)
 */

const localDB = {
  get: (key: string) => {
    const data = localStorage.getItem(`dh_local_${key}`);
    return data ? JSON.parse(data) : null;
  },
  save: (key: string, data: any) => {
    localStorage.setItem(`dh_local_${key}`, JSON.stringify(data));
  }
};

export const db = {
  // USER OPERATIONS
  user: {
    get: async (): Promise<User | null> => {
      if (!isSupabaseConfigured()) return localDB.get('user');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return localDB.get('user');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) return localDB.get('user');
        return {
          id: data.id,
          name: data.name,
          email: user.email,
          language: data.language || 'English',
          premium: data.premium || false,
          isAdmin: data.is_admin || false,
          avatar: data.avatar_url,
          theme: data.theme || 'light'
        };
      } catch {
        return localDB.get('user');
      }
    },
    save: async (user: User): Promise<void> => {
      localDB.save('user', user);
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            name: user.name,
            language: user.language,
            premium: user.premium,
            is_admin: user.isAdmin,
            avatar_url: user.avatar,
            theme: user.theme
          });
        } catch (e) { console.warn("Supabase sync failed, kept local"); }
      }
    },
    logout: async (): Promise<void> => {
      if (isSupabaseConfigured()) await supabase.auth.signOut();
      localStorage.removeItem('dh_local_user');
    }
  },

  // ADMIN OPERATIONS
  admin: {
    getAllUsers: async (): Promise<User[]> => {
      if (!isSupabaseConfigured()) {
        // In local mode, we only have one user stored
        const singleUser = localDB.get('user');
        return singleUser ? [singleUser] : [];
      }
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(d => ({
          id: d.id,
          name: d.name,
          language: d.language,
          premium: d.premium,
          isAdmin: d.is_admin,
          avatar: d.avatar_url,
          theme: d.theme
        }));
      } catch {
        return [];
      }
    },
    updateUserStatus: async (userId: string, updates: Partial<User>): Promise<void> => {
      if (!isSupabaseConfigured()) {
        const user = localDB.get('user');
        if (user && user.id === userId) localDB.save('user', { ...user, ...updates });
        return;
      }
      try {
        const mappedUpdates: any = {};
        if (updates.premium !== undefined) mappedUpdates.premium = updates.premium;
        if (updates.isAdmin !== undefined) mappedUpdates.is_admin = updates.isAdmin;
        
        await supabase.from('profiles').update(mappedUpdates).eq('id', userId);
      } catch (e) {}
    }
  },

  // INCOME OPERATIONS
  income: {
    getAll: async (): Promise<IncomeRecord[]> => {
      if (!isSupabaseConfigured()) return localDB.get('income') || [];
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return localDB.get('income') || [];
        const { data, error } = await supabase.from('income_records').select('*').eq('user_id', user.id).order('date', { ascending: false });
        if (error) throw error;
        return data;
      } catch {
        return localDB.get('income') || [];
      }
    },
    saveRecord: async (record: IncomeRecord): Promise<void> => {
      const current = localDB.get('income') || [];
      localDB.save('income', [record, ...current.filter((r: any) => r.id !== record.id)]);
      if (isSupabaseConfigured()) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) await supabase.from('income_records').upsert({ ...record, user_id: user.id });
        } catch (e) {}
      }
    },
    deleteRecord: async (id: string): Promise<void> => {
      const current = localDB.get('income') || [];
      localDB.save('income', current.filter((r: any) => r.id !== id));
      if (isSupabaseConfigured()) {
        try { await supabase.from('income_records').delete().eq('id', id); } catch (e) {}
      }
    },
    getSummary: async () => {
      const records = await db.income.getAll();
      const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
      const expenses = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
      return { income, expenses, savings: income - expenses };
    }
  },

  // COMMUNITY OPERATIONS
  community: {
    getPosts: async (): Promise<CommunityPost[]> => {
      if (!isSupabaseConfigured()) return localDB.get('community') || [];
      try {
        const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(d => ({
          id: d.id, author: d.author_name, content: d.content, category: d.category,
          timestamp: new Date(d.created_at).getTime(), likes: d.likes || 0, likedBy: d.liked_by || []
        }));
      } catch {
        return localDB.get('community') || [];
      }
    },
    savePost: async (post: CommunityPost): Promise<void> => {
      const current = localDB.get('community') || [];
      localDB.save('community', [post, ...current]);
      if (isSupabaseConfigured()) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) await supabase.from('community_posts').insert({
            id: post.id, author_id: user.id, author_name: post.author, content: post.content,
            category: post.category, created_at: new Date(post.timestamp).toISOString(), likes: post.likes, liked_by: post.likedBy
          });
        } catch (e) {}
      }
    }
  },

  // NOTIFICATIONS, NOTES, ALARMS (STUBBED FOR HYBRID RESILIENCE)
  notifications: {
    getAll: async () => localDB.get('notifications') || [],
    saveAll: async (notifs: any) => localDB.save('notifications', notifs)
  },
  notes: {
    getAll: async () => localDB.get('notes') || [],
    saveNote: async (note: any) => {
      const current = localDB.get('notes') || [];
      localDB.save('notes', [note, ...current.filter((n: any) => n.id !== note.id)]);
    },
    deleteNote: async (id: string) => {
      const current = localDB.get('notes') || [];
      localDB.save('notes', current.filter((n: any) => n.id !== id));
    }
  },
  alarms: {
    getAll: async () => localDB.get('alarms') || [],
    saveAlarm: async (alarm: any) => {
      const current = localDB.get('alarms') || [];
      localDB.save('alarms', [alarm, ...current.filter((a: any) => a.id !== alarm.id)]);
    },
    deleteAlarm: async (id: string) => {
      const current = localDB.get('alarms') || [];
      localDB.save('alarms', current.filter((a: any) => a.id !== id));
    }
  }
};
