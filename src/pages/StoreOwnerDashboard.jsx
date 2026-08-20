import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { SortableTable } from '../components/Table';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyPassword = { oldPassword: '', newPassword: '' };

export default function StoreOwnerDashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardResponse, ratingResponse] = await Promise.all([
          api.get('/store/dashboard'),
          api.get('/store/average-rating'),
        ]);
        setRows(Array.isArray(dashboardResponse.data) ? dashboardResponse.data : []);
        setAverageRating(ratingResponse.data.averageRating ?? 0);
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to load store data.' });
      } finally {
        setIsLoading(false);
      }
    };

    load();
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

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = query
      ? rows.filter((row) => [row.name, row.email, row.rating].some((value) => String(value ?? '').toLowerCase().includes(query)))
      : rows;
    return [...filtered].sort((left, right) => {
      const a = left[sortConfig.field];
      const b = right[sortConfig.field];
      if (typeof a === 'string' && typeof b === 'string') {
        return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      }
      return sortConfig.direction === 'asc' ? Number(a) - Number(b) : Number(b) - Number(a);
    });
  }, [rows, searchTerm, sortConfig]);

  const columns = [
    { key: 'name', label: 'Customer Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rating', label: 'Submitted Rating', sortable: true, render: (row) => `${row.rating ?? 0}/5` },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Store owner</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Welcome, {user?.name || 'Store owner'}</h1>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Change password</button>
        </div>
      </header>

      {message.text && <p className={`rounded-lg px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{message.text}</p>}

      {isLoading && <LoadingSpinner label="Loading store insights" />}

      {!isLoading && <>
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="owner-password-title">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" style={{ width: 'min(92vw, 28rem)' }}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h2 id="owner-password-title" className="text-xl font-semibold text-slate-800">Update password</h2><p className="mt-1 text-sm text-slate-500">Change your account password securely.</p></div>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} aria-label="Close password dialog" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Current password<input name="oldPassword" type="password" value={passwordForm.oldPassword} onChange={handlePasswordChange} required minLength={8} placeholder="Enter current password" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></label>
              <label className="block text-sm font-medium text-slate-700">New password<input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength={8} maxLength={16} placeholder="Enter new password" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></label>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setIsPasswordModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button disabled={isChangingPassword} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-300">{isChangingPassword ? 'Updating...' : 'Update password'}</button></div>
            </form>
          </section>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-h-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Average store rating</p><p className="mt-2 text-3xl font-bold text-slate-800">{averageRating}/5</p></div>
        <div className="min-h-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Submitted ratings</p><p className="mt-2 text-3xl font-bold text-slate-800">{rows.length}</p></div>
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium uppercase tracking-[0.16em] text-indigo-600">Customer insights</p><h2 className="mt-1 text-2xl font-semibold text-slate-800">Users who rated your store</h2></div><div className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 sm:w-80"><Search size={17} className="shrink-0 text-slate-500" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search customers" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none" /></div></div>
        <SortableTable title="Submitted ratings" columns={columns} rows={filteredRows} searchTerm={searchTerm} onSearchChange={setSearchTerm} sortConfig={sortConfig} onSort={(field, direction) => setSortConfig({ field, direction })} />
      </section>
      </>}
    </div>
  );
}