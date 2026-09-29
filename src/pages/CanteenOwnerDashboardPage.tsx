import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Store, 
  Search, 
  Laptop,
  QrCode,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  X,
  Copy,
  Check
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  MAIT_CANTEEN_OVERVIEW, 
  MAIT_CANTEEN_DEMAND_ITEMS, 
  CATEGORY_DEMAND_DISTRIBUTION 
} from '../data/canteenOwnerDemoData';
import { demandService } from '../services/demandService';
import { getCategoryBadgeProps } from '../utils/foodCategory';
import type { CanteenDemandItem, CanteenDemandOverview } from '../types';

export const CanteenOwnerDashboardPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<CanteenDemandItem[]>(MAIT_CANTEEN_DEMAND_ITEMS);
  const [overview, setOverview] = useState<CanteenDemandOverview>(MAIT_CANTEEN_OVERVIEW);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Subscribe to real-time Firestore demand signals
  useEffect(() => {
    const unsubscribe = demandService.subscribeCampusSignals('MAIT', (signals) => {
      if (signals.length > 0) {
        // Merge real-time signals with current demo baseline
        setItems((prevItems) => {
          return prevItems.map((item) => {
            const itemNorm = item.name.toLowerCase().trim();
            const relevantSignals = signals.filter(
              (s) => (s.foodName && s.foodName.toLowerCase().trim() === itemNorm) ||
                     (s.recommendedFoodName && s.recommendedFoodName.toLowerCase().trim() === itemNorm) ||
                     (s.originalFoodName && s.originalFoodName.toLowerCase().trim() === itemNorm)
            );

            if (relevantSignals.length === 0) return item;

            const extraSearches = relevantSignals.filter((s) => s.eventType === 'SEARCH').length;
            const extraAccepted = relevantSignals.filter((s) => s.eventType === 'SMART_SWAP_ACCEPTED').length;
            const extraRejected = relevantSignals.filter((s) => s.eventType === 'SMART_SWAP_REJECTED').length;

            const newSearch = item.searchInterest + extraSearches;
            const newAccepted = item.swapAcceptedCount + extraAccepted;
            const newRejected = item.swapRejectedCount + extraRejected;
            const newScore = (newSearch * 1) + (newAccepted * 3) + (newRejected * -2);

            return {
              ...item,
              searchInterest: newSearch,
              swapAcceptedCount: newAccepted,
              swapRejectedCount: newRejected,
              demandScore: newScore,
              interestLevel: newScore >= 200 ? 'high' : newScore >= 50 ? 'medium' : 'lower',
            };
          });
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await demandService.getDemandMetrics('MAIT');
      if (res.success && res.data) {
        const metrics = res.data;
        // Merge fetched metrics
        setOverview((prev) => ({
          ...prev,
          totalSignalsToday: prev.totalSignalsToday + metrics.totalSignals,
          totalSearchesToday: prev.totalSearchesToday + metrics.searchesCount,
          totalSwapsAcceptedToday: prev.totalSwapsAcceptedToday + metrics.swapsAcceptedCount,
          totalSwapsRejectedToday: prev.totalSwapsRejectedToday + metrics.swapsRejectedCount,
        }));
      }
    } catch (e) {
      console.warn('Manual refresh notice:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Toggle item stock status locally
  const handleToggleStock = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.canteenName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Top queried foods
  const topSearchedItems = useMemo(() => {
    return [...items].sort((a, b) => b.searchInterest - a.searchInterest).slice(0, 5);
  }, [items]);

  const campusQrUrl = `${window.location.origin}${import.meta.env.BASE_URL}campus?qr=MAIT-DELHI-01`;

  const handleCopyQrLink = () => {
    navigator.clipboard.writeText(campusQrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Top Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                <Store className="w-3.5 h-3.5" />
                MAIT Campus Canteen Intelligence
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Firestore Listener Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Canteen Owner &amp; Demand Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time student food interest, search volume, and Smart Swap conversion across MAIT cafeteria counters — aligning prep with genuine student appetite before cooking.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={handleManualRefresh}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs"
            >
              Refresh Signals
            </Button>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-md"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate Student Campus QR</span>
            </button>

            <Link
              to="/student"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
            >
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>Student View</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 1: STUDENT DEMAND SIGNALS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Demand Signals */}
        <Card padding="md" className="space-y-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Demand Signals</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{overview.totalSignalsToday}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18% today
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Searches + Accepted + Rejected</p>
        </Card>

        {/* Searches Logged */}
        <Card padding="md" className="space-y-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Searches Logged</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{overview.totalSearchesToday}</span>
            <span className="text-xs text-slate-400">query events</span>
          </div>
          <p className="text-[11px] text-slate-400">Student pre-purchase menu browsing</p>
        </Card>

        {/* Swaps Accepted */}
        <Card padding="md" className="space-y-2 border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-semibold uppercase tracking-wider">Swaps Accepted</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-900">{overview.totalSwapsAcceptedToday}</span>
            <span className="text-xs font-bold text-emerald-700">(+3 pts each)</span>
          </div>
          <p className="text-[11px] text-emerald-800/80">Elected healthier campus alternatives</p>
        </Card>

        {/* Swaps Rejected */}
        <Card padding="md" className="space-y-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Swaps Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{overview.totalSwapsRejectedToday}</span>
            <span className="text-xs font-medium text-slate-400">(-2 pts each)</span>
          </div>
          <p className="text-[11px] text-slate-400">Valuable student preference feedback</p>
        </Card>
      </div>

      {/* SECTION 2: DEMAND TRENDS & TOP SEARCHES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Chart */}
        <Card padding="lg" className="space-y-5 lg:col-span-1 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Student Category Interest</h3>
            </div>
            <span className="text-[11px] text-slate-400">Share of searches</span>
          </div>

          <div className="space-y-4">
            {CATEGORY_DEMAND_DISTRIBUTION.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{cat.label}</span>
                  <span className="font-bold text-slate-900">{cat.percentage}% ({cat.searchCount} searches)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.category === 'MEAL'
                        ? 'bg-indigo-600'
                        : cat.category === 'SNACK'
                        ? 'bg-amber-500'
                        : cat.category === 'BEVERAGE'
                        ? 'bg-cyan-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <strong>Demand Insight: </strong>Complete meals (Sandwiches, Rajma Chawal, Chole Bhature) command 50% of student queries, followed by beverages during break hours.
          </div>
        </Card>

        {/* Top Queried Dishes + Swap Conversion */}
        <Card padding="lg" className="space-y-5 lg:col-span-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Top Searched Foods &amp; Student Swap Conversion
              </h3>
            </div>
            <Badge variant="purple" size="sm">Real Demand Signals</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Searched List */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Most Queried Foods</span>
                <span className="text-[11px] text-slate-400">Today</span>
              </div>
              <div className="space-y-2">
                {topSearchedItems.map((dish, idx) => (
                  <div key={dish.itemId} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 text-[11px] w-4">{idx + 1}.</span>
                      <span className="font-semibold text-slate-800">{dish.name}</span>
                    </div>
                    <span className="font-mono text-slate-500 text-[11px] font-bold">
                      {dish.searchInterest} searches
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Swap Acceptance vs Rejection */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Smart Swap Conversion Behavior</span>
                  <span className="text-[11px] text-emerald-600 font-bold">Today</span>
                </div>
                
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800">Top Selected Alternative</span>
                      <span className="text-xs font-bold text-emerald-600">76 accepted</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Paneer Sandwich (Amul Shop, ₹30): </strong>Frequently chosen when students scan higher-fat fried options.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Highest Rejected Alternative</span>
                      <span className="text-xs font-bold text-rose-500">18 rejected</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Singapori Chowmein: </strong>Students reject this alternative due to preference for rice dishes over noodles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 italic pt-2">
                * Demand score formula: (searches &times; 1) + (accepted &times; 3) + (rejected &times; -2)
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 3: MENU INTELLIGENCE & POTENTIAL OPTIMIZATION TABLE */}
      <Card padding="none" className="border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Campus Menu Intelligence &amp; Demand Signals
            </h2>
            <p className="text-xs text-slate-500">
              Real-time student interest and pre-purchase preference metrics across MAIT canteen offerings.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search dish or canteen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none w-44"
              />
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {['all', 'MEAL', 'SNACK', 'BEVERAGE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg transition-colors capitalize ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Dish &amp; Canteen</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3 text-center">Searches</th>
                <th className="py-3 px-3 text-center">Swaps Accepted</th>
                <th className="py-3 px-3 text-center">Swaps Rejected</th>
                <th className="py-3 px-3 text-center">Demand Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Potential Menu Optimization</th>
                <th className="py-3 px-3 text-right">In Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.map((item) => {
                const badgeProps = getCategoryBadgeProps(item.category);
                return (
                  <tr key={item.itemId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Dish & Canteen */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{item.name}</div>
                      <div className="text-[11px] font-normal text-slate-400">{item.canteenName}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeProps.bgClass} ${badgeProps.textClass}`}>
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      ₹{item.price}
                    </td>

                    {/* Searches */}
                    <td className="py-3.5 px-3 text-center font-mono font-semibold">
                      {item.searchInterest}
                    </td>

                    {/* Swaps Accepted */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-700">
                      +{item.swapAcceptedCount}
                    </td>

                    {/* Swaps Rejected */}
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-rose-500">
                      {item.swapRejectedCount > 0 ? `-${item.swapRejectedCount}` : '0'}
                    </td>

                    {/* Demand Score */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold ${
                        item.demandScore >= 250
                          ? 'bg-emerald-100 text-emerald-900'
                          : item.demandScore >= 100
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.demandScore}
                      </span>
                    </td>

                    {/* Interest Level Badge */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.interestLevel === 'high'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.interestLevel === 'medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.interestLevel === 'high' ? 'High Interest' : item.interestLevel === 'medium' ? 'Medium' : 'Lower'}
                      </span>
                    </td>

                    {/* Menu Optimization Recommendation */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                      {item.recommendation}
                    </td>

                    {/* In Stock Toggle */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item.itemId)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Sold Out'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* STUDENT CAMPUS QR GENERATOR MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase tracking-wider">
                  Campus Counter QR
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Student Campus Access QR
              </h2>
              <p className="text-xs text-slate-500">
                Display or print this QR code at your canteen counter so students can scan and verify their MAIT campus session.
              </p>
            </div>

            {/* QR Visual */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-3">
              <div className="w-40 h-40 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                  {/* Corner squares */}
                  <rect x="10" y="10" width="24" height="24" rx="3" fill="#0f172a" />
                  <rect x="14" y="14" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="#4f46e5" />

                  <rect x="66" y="10" width="24" height="24" rx="3" fill="#0f172a" />
                  <rect x="70" y="14" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="#4f46e5" />

                  <rect x="10" y="66" width="24" height="24" rx="3" fill="#0f172a" />
                  <rect x="14" y="70" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="#4f46e5" />

                  {/* Pattern dots */}
                  <rect x="42" y="12" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="52" y="12" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="42" y="24" width="6" height="6" rx="1" fill="#4f46e5" />
                  <rect x="52" y="24" width="6" height="6" rx="1" fill="#0f172a" />

                  <rect x="42" y="42" width="16" height="16" rx="2" fill="#4f46e5" />
                  <rect x="12" y="44" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="24" y="44" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="68" y="44" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="80" y="44" width="6" height="6" rx="1" fill="#0f172a" />

                  <rect x="42" y="68" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="52" y="68" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="42" y="80" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="52" y="80" width="6" height="6" rx="1" fill="#4f46e5" />
                  <rect x="70" y="70" width="18" height="18" rx="2" fill="#0f172a" />
                </svg>
              </div>

              <div>
                <div className="font-mono font-bold text-xs text-slate-800">
                  Campus Code: MAIT-DELHI-01
                </div>
                <div className="text-[11px] text-slate-500">
                  Maharaja Agrasen Institute of Technology
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopyQrLink}
                className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {copied ? 'Copied Student Access Link!' : 'Copy Student Verification Link'}
              </Button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Print Official Counter Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ground Truth & Privacy Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Zero Student PII: </strong>
            EcoBite captures strictly aggregate food discovery signals (Search, Swap Accepted, Swap Rejected). Student identities, card details, and personal histories are neither recorded nor visible to canteen staff.
          </span>
        </div>
        <div className="shrink-0 hidden md:block">
          <Badge variant="slate" size="sm">Strict Privacy Guardrail</Badge>
        </div>
      </div>
    </div>
  );
};
