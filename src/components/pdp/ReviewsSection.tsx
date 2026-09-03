'use client';

import React from 'react';
import { Review } from '../../types';
import { Star, ThumbsUp, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

interface ReviewsSectionProps {
  rating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  reviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  rating,
  totalReviews,
  distribution,
  reviews,
}) => {
  return (
    <div id="reviews-section" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Title & Overview */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
            Customer Reviews & Verified Hardware Feedback
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Real reviews from verified Ahilyanagar & MIDC factory buyers
          </p>
        </div>
      </div>

      {/* Rating Breakdown & Bar Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
        
        {/* Rating Score Summary */}
        <div className="md:col-span-4 text-center md:text-left space-y-1">
          <div className="text-4xl font-black text-slate-950 flex items-center justify-center md:justify-start gap-2">
            <span>{rating}</span>
            <span className="text-xl font-bold text-slate-400">/ 5</span>
          </div>

          <div className="flex items-center justify-center md:justify-start text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>

          <div className="text-xs font-bold text-slate-600">
            Based on {totalReviews} verified customer reviews
          </div>
        </div>

        {/* Rating Distribution Progress Bars */}
        <div className="md:col-span-8 space-y-1.5 text-xs font-bold text-slate-700">
          {[5, 4, 3, 2, 1].map((starKey) => {
            const percent = distribution[starKey] || 0;

            return (
              <div key={starKey} className="flex items-center gap-3">
                <span className="w-8 shrink-0 flex items-center gap-0.5">
                  {starKey} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>

                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="w-10 text-right text-slate-500 font-bold shrink-0">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Verified Reviews List */}
      <div className="space-y-4 divide-y divide-slate-100">
        {reviews.map((rev) => (
          <div key={rev.id} className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center">
                  {rev.userName.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>{rev.userName}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {rev.userLocation} • {rev.date}
                  </div>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h5 className="font-extrabold text-xs text-slate-900">{rev.title}</h5>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {rev.comment}
            </p>

            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-bold">
              <button
                onClick={() => alert('Marked review as helpful!')}
                className="flex items-center gap-1 hover:text-slate-900 transition"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({rev.helpfulCount})
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
