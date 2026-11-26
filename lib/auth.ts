// Temporary localStorage-based auth
// Will be replaced with Supabase Auth later

export interface User {
  email: string;
  id: string;
}

export interface AuthUser {
  email: string;
  password: string;
}

// Store users in localStorage
const USERS_KEY = 'chatbot_saas_users';
const CURRENT_USER_KEY = 'chatbot_saas_current_user';

function getUsers(): AuthUser[] {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

function saveUsers(users: AuthUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (typeof window === 'undefined') {
    return { user: null, error: 'Not in browser environment' };
  }

  // Validation
  if (!email || !password) {
    return { user: null, error: 'Email and password are required' };
  }

  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters' };
  }

  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { user: null, error: 'User already exists' };
  }

  // Create new user
  const newUser: AuthUser = { email, password };
  users.push(newUser);
  saveUsers(users);

  // Set current user
  const user: User = { email, id: email };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  return { user, error: null };
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (typeof window === 'undefined') {
    return { user: null, error: 'Not in browser environment' };
  }

  if (!email || !password) {
    return { user: null, error: 'Email and password are required' };
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return { user: null, error: 'Invalid email or password' };
  }

  // Set current user
  const currentUser: User = { email: user.email, id: user.email };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return { user: currentUser, error: null };
}

export function signOut() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}
