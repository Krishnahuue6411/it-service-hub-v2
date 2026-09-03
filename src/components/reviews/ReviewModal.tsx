'use client';

import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { X, Award, CheckCircle2, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string; // e.g. "Vikram K. (Lead Hardware Technician)" or "Job Card #JOB-8941"
  onSubmitSuccess?: (reviewData: { rating: number; reviewText: string }) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  targetTitle,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess({ rating, reviewText });
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Review Submitted!</h3>
            <p className="text-xs text-slate-600 font-medium px-4">
              Thank you for providing feedback for <span className="font-extrabold text-slate-900">{targetTitle}</span>. Your review helps elevate service quality across Ahilyanagar MIDC.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-2xl transition shadow-lg"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Write Service Review</h3>
                <p className="text-xs text-slate-500 font-medium">{targetTitle}</p>
              </div>
            </div>

            {/* Star Rating Component */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                Overall Rating
              </label>
              <div className="flex justify-center">
                <StarRating value={rating} onChange={setRating} size="lg" showValueText />
              </div>
            </div>

            {/* Review Comment Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Your Detailed Feedback</span>
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share details about repair speed, technician professionalism, and device performance..."
                required
                rows={4}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none font-medium"
              ></textarea>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-xs py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting Review...' : '⭐ Submit Service Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
