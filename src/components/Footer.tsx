import React from 'react';
import { Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">EcoBite AI</span>
          <span>— Food Decision Platform for Indian Colleges</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Protected Campus Access Architecture</span>
          <span>•</span>
          <span>Pilot: MAIT</span>
          <span>•</span>
          <span>Hackathon Foundation</span>
        </div>
      </div>
    </footer>
  );
};
