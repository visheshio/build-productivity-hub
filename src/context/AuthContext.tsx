import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ph-auth-user';
const ACCOUNTS_KEY = 'ph-auth-accounts';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getAccounts(): Record<string, { password: string; user: User }> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  'from-violet-500 to-indigo-600',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
];

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    const accounts = getAccounts();
    const key = email.toLowerCase().trim();
    const account = accounts[key];
    if (!account) return { error: 'No account found with this email.' };
    if (account.password !== password) return { error: 'Incorrect password.' };
    setUser(account.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user));
    return {};
  };

  const signUp = async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    if (!name.trim()) return { error: 'Name is required.' };
    if (!email.includes('@')) return { error: 'Enter a valid email.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

    const accounts = getAccounts();
    const key = email.toLowerCase().trim();
    if (accounts[key]) return { error: 'An account with this email already exists.' };

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: key,
      avatar: randomColor(),
      createdAt: new Date().toISOString(),
    };

    accounts[key] = { password, user: newUser };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return {};
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = (updates: Partial<Pick<User, 'name' | 'avatar'>>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const accounts = getAccounts();
    const key = user.email;
    if (accounts[key]) {
      accounts[key].user = updated;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { getInitials };
