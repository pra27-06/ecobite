import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from './Badge';
import type { MockFoodItem } from '../data/mockFoods';

export interface FoodCardProps {
  food: MockFoodItem;
  showSwapAction?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, showSwapAction = false }) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
              {food.emoji}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                {food.name}
              </h3>
              {food.hindiName ? (
                <span className="text-[11px] text-slate-400 font-normal">{food.hindiName}</span>
              ) : null}
            </div>
          </div>
          <Badge variant="slate" size="sm">
            {food.category}
          </Badge>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {food.description}
        </p>

        {/* Mini 3-Dimension Pill Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1 pb-2 border-y border-slate-100 text-center">
          <div className="py-1">
            <span className="block text-[10px] font-semibold uppercase text-slate-400">Health</span>
            <span className="text-xs font-bold text-rose-600">{food.scores.body.toFixed(1)}/10</span>
          </div>
          <div className="py-1 border-x border-slate-100">
            <span className="block text-[10px] font-semibold uppercase text-slate-400">Budget</span>
            <span className="text-xs font-bold text-amber-600">{food.scores.wallet.toFixed(1)}/10</span>
          </div>
          <div className="py-1">
            <span className="block text-[10px] font-semibold uppercase text-slate-400">Eco</span>
            <span className="text-xs font-bold text-emerald-600">{food.scores.planet.toFixed(1)}/10</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-2">
        <Link
          to={`/analysis/${food.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors"
        >
          <span>View Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {showSwapAction && food.defaultSwapId ? (
          <Link
            to={`/swap/${food.id}`}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Check recommended Smart Swap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Swap</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
};
