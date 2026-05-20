const USER_KEY = 'staybuddy_user';
const ACCOUNTS_KEY = 'staybuddy_accounts';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('authChange'));
}

export function signOut() {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('authChange'));
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function signUp({ name, email, phone, password }) {
  const accounts = loadAccounts();
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return { ok: false, error: 'Email is required.' };
  if (accounts.some((a) => a.email === normalizedEmail)) return { ok: false, error: 'Email already exists.' };
  if (!password || password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

  const account = {
    id: `U-${Math.floor(Math.random() * 1000000)}`,
    name: (name || normalizedEmail.split('@')[0] || 'User').trim(),
    email: normalizedEmail,
    phone: (phone || '').trim(),
    password,
    createdAt: new Date().toISOString(),
  };
  saveAccounts([account, ...accounts]);
  const { password: _pw, ...safeUser } = account;
  setCurrentUser(safeUser);
  return { ok: true, user: safeUser };
}

export function logIn({ email, password }) {
  const accounts = loadAccounts();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const match = accounts.find((a) => a.email === normalizedEmail);
  if (!match) return { ok: false, error: 'Account not found.' };
  if (match.password !== password) return { ok: false, error: 'Incorrect password.' };
  const { password: _pw, ...safeUser } = match;
  setCurrentUser(safeUser);
  return { ok: true, user: safeUser };
}

export function getUserBookings() {
  const user = getCurrentUser();
  if (!user) return [];
  try {
    const raw = localStorage.getItem(`staybuddy_bookings_${user.id}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addUserBooking(booking) {
  const user = getCurrentUser();
  if (!user) return;
  const bookings = getUserBookings();
  if (!bookings.some((b) => b.id === booking.id)) {
    const updated = [booking, ...bookings];
    localStorage.setItem(`staybuddy_bookings_${user.id}`, JSON.stringify(updated));
  }
}

export function googleSignIn(account) {
  const { name, email, photo } = account;
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = loadAccounts();
  let match = accounts.find((a) => a.email === normalizedEmail);

  if (!match) {
    match = {
      id: `G-${Math.floor(Math.random() * 1000000)}`,
      name,
      email: normalizedEmail,
      photo,
      createdAt: new Date().toISOString(),
      provider: 'google'
    };
    saveAccounts([match, ...accounts]);
  }

  const { password: _pw, ...safeUser } = match;
  setCurrentUser(safeUser);
  return { ok: true, user: safeUser };
}
