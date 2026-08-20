import { Star } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function StarRating({ value = 0, onChange, onSubmit, disabled = false, label = 'Rate this store' }) {
  const [rating, setRating] = useState(value);
  const [hovered, setHovered] = useState(0);

  const displayValue = useMemo(() => hovered || rating, [hovered, rating]);

  const handleClick = (next) => {
    if (disabled) return;
    setRating(next);
    onChange?.(next);
  };

  const handleSubmit = () => {
    if (disabled || !rating) return;
    onSubmit?.(rating);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-sm font-medium text-slate-700">{label}</p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleClick(star)}
            disabled={disabled}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <Star
              size={24}
              className={star <= displayValue ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !rating}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Submit rating
      </button>
    </div>
  );
}
