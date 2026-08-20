import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { loginValidationSchema } from '../utils/validations';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = async (values) => {
    try {
      const response = await api.post('/auth/login', values);
      const user = response.data?.user || response.data;
      const token = response.data?.token || user?.token;

      if (!token) {
        throw new Error('Login response did not include a token');
      }

      login({ ...user, token });

      const role = (user?.role || 'USER').toUpperCase();
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'STORE_OWNER') navigate('/store-owner');
      else navigate('/user');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError('root', { message });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Store Rating</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-800">Welcome back</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white"
              placeholder="********"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </p>
      </div>
      </main>
      <Footer />
    </div>
  );
}
