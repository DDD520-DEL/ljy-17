import { User, LoginCredentials, RegisterData } from '@/types';

const CLOUD_USERS_KEY = 'cloud_users';
const CLOUD_SESSION_KEY = 'cloud_session';
const TOKEN_KEY = 'cloud_auth_token';

interface StoredUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash)}_${password.length}`;
};

const getStoredUsers = (): StoredUser[] => {
  const data = localStorage.getItem(CLOUD_USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const setStoredUsers = (users: StoredUser[]): void => {
  localStorage.setItem(CLOUD_USERS_KEY, JSON.stringify(users));
};

const toPublicUser = (stored: StoredUser): User => ({
  id: stored.id,
  email: stored.email,
  username: stored.username,
  avatar: stored.avatar,
  createdAt: stored.createdAt,
  lastLoginAt: stored.lastLoginAt,
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(600);

    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: '请输入有效的邮箱地址' };
    }
    if (!data.username || data.username.trim().length < 2) {
      return { success: false, error: '用户名至少需要2个字符' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: '密码至少需要6个字符' };
    }

    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: '该邮箱已被注册' };
    }
    if (users.find(u => u.username === data.username)) {
      return { success: false, error: '该用户名已被使用' };
    }

    const now = new Date().toISOString();
    const newUser: StoredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email.trim().toLowerCase(),
      username: data.username.trim(),
      passwordHash: hashPassword(data.password),
      createdAt: now,
      lastLoginAt: now,
    };

    users.push(newUser);
    setStoredUsers(users);

    const token = `token_${newUser.id}_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify({ userId: newUser.id, token }));

    return { success: true, user: toPublicUser(newUser) };
  },

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);

    if (!credentials.email || !credentials.password) {
      return { success: false, error: '请输入邮箱和密码' };
    }

    const users = getStoredUsers();
    const email = credentials.email.trim().toLowerCase();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: '该邮箱未注册' };
    }

    if (user.passwordHash !== hashPassword(credentials.password)) {
      return { success: false, error: '密码错误' };
    }

    user.lastLoginAt = new Date().toISOString();
    setStoredUsers(users);

    const token = `token_${user.id}_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify({ userId: user.id, token }));

    return { success: true, user: toPublicUser(user) };
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CLOUD_SESSION_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);

    const sessionStr = localStorage.getItem(CLOUD_SESSION_KEY);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      const users = getStoredUsers();
      const user = users.find(u => u.id === session.userId);
      return user ? toPublicUser(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const sessionStr = localStorage.getItem(CLOUD_SESSION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    return !!(sessionStr && token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};
