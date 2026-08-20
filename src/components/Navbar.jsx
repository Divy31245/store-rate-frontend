import { LogOut, ShieldCheck, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            {isAdmin ? <ShieldCheck size={18} /> : <Store size={18} />}
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">StoreRate</p>
            <p className="text-xs text-slate-500">{user ? (isAdmin ? 'Administration' : 'Your ratings workspace') : 'Simple, trusted store ratings'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:block">{user.email}</span>
              <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                <LogOut size={15} /> Log out
              </button>
            </>
          ) : (
            <Link to="/register" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
              Create account
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}