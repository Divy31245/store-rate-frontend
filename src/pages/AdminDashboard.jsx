import { useEffect, useMemo, useState } from 'react';
import { SortableTable } from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyUser = { name: '', email: '', password: '', address: '', role: 'USER' };
const emptyStore = { name: '', email: '', address: '', owner_id: '' };

const filterRows = (rows, search, fields) => {
  const query = search.trim().toLowerCase();
  return query ? rows.filter((row) => fields.some((field) => String(row[field] ?? '').toLowerCase().includes(query))) : rows;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userForm, setUserForm] = useState(emptyUser);
  const [storeForm, setStoreForm] = useState(emptyStore);
  const [userSearch, setUserSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userSort, setUserSort] = useState({ field: 'name', direction: 'asc' });
  const [storeSort, setStoreSort] = useState({ field: 'name', direction: 'asc' });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    const [statsResponse, usersResponse, storesResponse] = await Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users'),
      api.get('/admin/stores'),
    ]);
    setStats(statsResponse.data);
    setUsers(usersResponse.data);
    setStores(storesResponse.data);
  };

  useEffect(() => {
    loadAdminData()
      .catch(() => setFeedback({ type: 'error', text: 'Unable to load admin data.' }))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));
  };

  const submitForm = async (event, endpoint, payload, message, reset, setForm) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', text: '' });
    try {
      await api.post(endpoint, payload);
      await loadAdminData();
      setForm(reset);
      setFeedback({ type: 'success', text: message });
    } catch (error) {
      setFeedback({ type: 'error', text: error.response?.data?.message || 'Request failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      await loadAdminData();
      setFeedback({ type: 'success', text: 'User role updated successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.response?.data?.message || 'Unable to update user role.' });
    }
  };

  const filteredUsers = useMemo(
    () => filterRows(users, userSearch, ['name', 'email', 'address', 'role']).filter((row) => !roleFilter || row.role === roleFilter),
    [users, userSearch, roleFilter],
  );
  const filteredStores = useMemo(() => filterRows(stores, storeSearch, ['name', 'email', 'address']), [stores, storeSearch]);
  const owners = users.filter((row) => row.role === 'STORE_OWNER');

  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => (
        <select
          value={row.role}
          onChange={(event) => handleRoleChange(row.id, event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="USER">Normal user</option>
          <option value="STORE_OWNER">Store owner</option>
          <option value="ADMIN">Administrator</option>
        </select>
      ),
    },
    { key: 'store_owner_rating', label: 'Owner Rating', sortable: true, render: (row) => row.role === 'STORE_OWNER' ? `${row.store_owner_rating}/5` : '-' },
  ];
  const storeColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'average_rating', label: 'Rating', sortable: true, render: (row) => `${row.average_rating}/5` },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">System Administrator</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Signed in as {user?.email}</p>
        </div>
      </header>

      {isLoading && <LoadingSpinner label="Loading administrator dashboard" />}

      {!isLoading && <>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[['Total users', stats.users], ['Total stores', stats.stores], ['Submitted ratings', stats.ratings]].map(([label, value]) => (
          <div key={label} className="min-h-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {feedback.text && <p className={`rounded-lg px-4 py-3 text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{feedback.text}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">Add user</h2>
          <form onSubmit={(event) => submitForm(event, '/admin/users', userForm, 'User added successfully.', emptyUser, setUserForm)} className="grid gap-3">
            <input name="name" value={userForm.name} onChange={handleChange(setUserForm)} required minLength={20} maxLength={60} placeholder="Name (20-60 characters)" className="rounded-lg border px-3 py-2.5 text-sm" />
            <input name="email" type="email" value={userForm.email} onChange={handleChange(setUserForm)} required placeholder="Email" className="rounded-lg border px-3 py-2.5 text-sm" />
            <input name="password" type="password" value={userForm.password} onChange={handleChange(setUserForm)} required minLength={8} maxLength={16} placeholder="Password" className="rounded-lg border px-3 py-2.5 text-sm" />
            <input name="address" value={userForm.address} onChange={handleChange(setUserForm)} required maxLength={400} placeholder="Address" className="rounded-lg border px-3 py-2.5 text-sm" />
            <select name="role" value={userForm.role} onChange={handleChange(setUserForm)} className="rounded-lg border px-3 py-2.5 text-sm">
              <option value="USER">Normal user</option><option value="STORE_OWNER">Store owner</option><option value="ADMIN">Administrator</option>
            </select>
            <button disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-indigo-300">{isSubmitting ? 'Adding...' : 'Add user'}</button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">Add store</h2>
          <form onSubmit={(event) => submitForm(event, '/admin/stores', { ...storeForm, owner_id: storeForm.owner_id || null }, 'Store added successfully.', emptyStore, setStoreForm)} className="grid gap-3">
            <input name="name" value={storeForm.name} onChange={handleChange(setStoreForm)} required placeholder="Store name" className="rounded-lg border px-3 py-2.5 text-sm" />
            <input name="email" type="email" value={storeForm.email} onChange={handleChange(setStoreForm)} required placeholder="Store email" className="rounded-lg border px-3 py-2.5 text-sm" />
            <input name="address" value={storeForm.address} onChange={handleChange(setStoreForm)} required maxLength={400} placeholder="Store address" className="rounded-lg border px-3 py-2.5 text-sm" />
            <select name="owner_id" value={storeForm.owner_id} onChange={handleChange(setStoreForm)} className="rounded-lg border px-3 py-2.5 text-sm">
              <option value="">No owner assigned</option>
              {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>)}
            </select>
            <button disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-indigo-300">{isSubmitting ? 'Adding...' : 'Add store'}</button>
          </form>
        </section>
      </div>

      <SortableTable title="All users" columns={userColumns} rows={filteredUsers} searchTerm={userSearch} onSearchChange={setUserSearch} sortConfig={userSort} onSort={(field, direction) => setUserSort({ field, direction })} />
      <div className="flex items-center gap-3">
        <label htmlFor="role-filter" className="text-sm font-medium text-slate-600">Role filter</label>
        <select id="role-filter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All roles</option><option value="USER">Normal users</option><option value="STORE_OWNER">Store owners</option><option value="ADMIN">Administrators</option>
        </select>
      </div>
      <SortableTable title="All stores" columns={storeColumns} rows={filteredStores} searchTerm={storeSearch} onSearchChange={setStoreSearch} sortConfig={storeSort} onSort={(field, direction) => setStoreSort({ field, direction })} />
      </>}
    </div>
  );
}