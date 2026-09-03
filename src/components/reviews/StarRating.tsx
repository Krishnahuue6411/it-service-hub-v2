'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value?: number; // Initial rating (1-5)
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  showValueText?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  readOnly = false,
  size = 'md',
  onChange,
  showValueText = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(value);

  const displayRating = hoverRating || currentRating || value;

  const handleStarClick = (selected: number) => {
    if (readOnly) return;
    setCurrentRating(selected);
    if (onChange) {
      onChange(selected);
    }
  };

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              className={`transition transform ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-110 active:scale-95'
              } focus:outline-none`}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValueText && (
        <span className="font-extrabold text-slate-800 text-xs ml-1">
          {displayRating > 0 ? `${displayRating}.0 / 5.0` : 'Unrated'}
        </span>
      )}
    </div>
  );
};
