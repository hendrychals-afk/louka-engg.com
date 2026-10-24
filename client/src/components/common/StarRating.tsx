import React, { useState } from 'react';

interface StarRatingProps {
  value: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  interactive = false,
  onChange,
  size = 'md',
}) => {
  const [hoverVal, setHoverVal] = useState<number>(0);

  const sizeClasses = {
    sm: 'text-sm gap-0.5',
    md: 'text-xl gap-1',
    lg: 'text-3xl gap-1.5',
  };

  const activeRating = hoverVal || value;

  return (
    <div
      className={`inline-flex items-center text-amber-500 ${sizeClasses[size]}`}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHoverVal(star)}
          onMouseLeave={() => interactive && setHoverVal(0)}
          className={`transition-transform duration-150 ${
            interactive ? 'cursor-pointer hover:scale-125 focus:outline-none focus:scale-125' : 'cursor-default pointer-events-none'
          } ${star <= activeRating ? 'text-amber-500' : 'text-slate-300'}`}
          aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
        >
          ★
        </button>
      ))}
    </div>
  );
};
