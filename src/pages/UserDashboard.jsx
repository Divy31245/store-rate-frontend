import { useEffect, useState } from 'react';
import { Search, Star, X } from 'lucide-react';
import StarRating from '../components/StarRating';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyPassword = { oldPassword: '', newPassword: '' };

export default function UserDashboard() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadStores = async (searchTerm = '') => {
    try {
      const response = await api.get('/user/stores', { params: { search: searchTerm } });
      setStores(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setStores([]);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to load stores.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setIsChangingPassword(true);
    try {
      const response = await api.put('/user/password', passwordForm);
      setMessage({ type: 'success', text: response.data.message });
      setPasswordForm(emptyPassword);
      setIsPasswordModalOpen(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRating = async (store, rating) => {
    try {
      const response = store.user_rating_id
        ? await api.put(`/user/ratings/${store.user_rating_id}`, { rating })
        : await api.post('/user/ratings', { store_id: store.id, rating });
      setMessage({ type: 'success', text: response.data.message });
      await loadStores(search);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to save rating.' });
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    loadStores(value);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Normal user</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Welcome, {user?.name || 'Customer'}</h1>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
            Change password
          </button>
        </div>
      </header>

      {message.text && <p className={`rounded-lg px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{message.text}</p>}

      {isLoading && <LoadingSpinner label="Loading stores" />}

      {!isLoading && <>
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="password-modal-title">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" style={{ width: 'min(92vw, 28rem)' }}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="password-modal-title" className="text-xl font-semibold text-slate-800">Update password</h2>
                <p className="mt-1 text-sm text-slate-500">Change your account password securely.</p>
              </div>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} aria-label="Close password dialog" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Current password
                <input name="oldPassword" type="password" value={passwordForm.oldPassword} onChange={handlePasswordChange} required minLength={8} placeholder="Enter current password" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                New password
                <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength={8} maxLength={16} placeholder="Enter new password" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isChangingPassword} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300">{isChangingPassword ? 'Updating...' : 'Update password'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-indigo-600">Browse stores</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800">Rate your experience</h2>
          </div>
          <div className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 sm:w-80">
            <Search size={17} className="shrink-0 text-slate-500" />
            <input value={search} onChange={handleSearch} placeholder="Search by name or address" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stores.map((store) => (
            <article key={store.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{store.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{store.address}</p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-sm font-medium text-amber-700">
                  <Star size={14} className="fill-amber-400 text-amber-400" /> {store.average_rating ?? 0}/5
                </div>
              </div>
              <p className="mb-3 text-sm text-slate-600">Your rating: <strong>{store.user_rating ?? 'Not submitted'}</strong></p>
              <StarRating
                value={store.user_rating || 0}
                onSubmit={(rating) => handleRating(store, rating)}
                label={store.user_rating_id ? 'Modify your rating' : 'Submit your rating'}
              />
            </article>
          ))}
        </div>
        {!stores.length && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No stores found.</p>}
      </section>
      </>}
    </div>
  );
}