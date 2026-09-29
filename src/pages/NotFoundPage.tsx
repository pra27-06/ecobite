import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-16 space-y-4">
      <h2 className="text-4xl font-extrabold text-slate-800">404</h2>
      <p className="text-slate-600 text-sm">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
