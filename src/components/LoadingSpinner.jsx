export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex min-h-48 items-center justify-center" role="status" aria-label={label}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
    </div>
  );
}