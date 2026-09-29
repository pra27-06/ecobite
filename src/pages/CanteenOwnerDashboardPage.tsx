import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  ArrowUpRight, 
  Store, 
  UtensilsCrossed, 
  Info, 
  Search, 
  Laptop
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { 
  MAIT_CANTEEN_OVERVIEW, 
  MAIT_CANTEEN_DEMAND_ITEMS, 
  CATEGORY_DEMAND_DISTRIBUTION 
} from '../data/canteenOwnerDemoData';
import { getCategoryBadgeProps } from '../utils/foodCategory';
import type { CanteenDemandItem } from '../types';

export const CanteenOwnerDashboardPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<CanteenDemandItem[]>(MAIT_CANTEEN_DEMAND_ITEMS);

  // Toggle item stock status locally for demonstration
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive B2B Top Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <Store className="w-3.5 h-3.5" />
                MAIT Campus Canteen Intelligence
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                DEMO / SAMPLE DATA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Canteen Owner & Kitchen Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time student demand signals, kitchen prep planning, and daily waste mitigation across MAIT cafeteria counters.
            </p>
          </div>

          {/* Quick Dual-Device Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/campus"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
            >
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>Switch to Student Demo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Two-Device Hackathon Demo Guide Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Laptop className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>
            <strong>Two-Screen Presentation Mode: </strong>
            Keep this screen open on <em>Laptop 2</em> (Canteen Intelligence) while demonstrating live food decisions on <em>Laptop 1</em> (Student View).
          </span>
        </div>
        <Link
          to="/context"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 shrink-0"
        >
          <span>Architecture Docs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* SECTION 1: TODAY'S OPERATIONAL OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card padding="md" className="space-y-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Campus Meals</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{MAIT_CANTEEN_OVERVIEW.totalOrders}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% today
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Across 4 physical MAIT dining halls</p>
        </Card>

        {/* Revenue Estimate */}
        <Card padding="md" className="space-y-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated Day Sales</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="font-bold text-sm">₹</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{MAIT_CANTEEN_OVERVIEW.totalRevenueEstimate.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">Grounded in MAIT prices</span>
          </div>
          <p className="text-[11px] text-slate-400">Verified prices ₹15 – ₹150</p>
        </Card>

        {/* Top Demanded Meal */}
        <Card padding="md" className="space-y-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Peak Demand Dish</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 truncate">
            {MAIT_CANTEEN_OVERVIEW.mostDemandedItem}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">188 student searches today</p>
        </Card>

        {/* Waste Mitigation Indicator */}
        <Card padding="md" className="space-y-2 border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated Day Excess</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-900">
              {MAIT_CANTEEN_OVERVIEW.totalExcessMeals} meals
            </span>
            <span className="text-xs font-semibold text-amber-700">
              ({MAIT_CANTEEN_OVERVIEW.overallWastePercentage}% prep)
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80">Demo metric based on daily prep vs sold</p>
        </Card>
      </div>

      {/* SECTION 2: DEMAND TRENDS & STUDENT DECISION SIGNALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Chart */}
        <Card padding="lg" className="space-y-5 lg:col-span-1 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Meal Category Share</h3>
            </div>
            <span className="text-[11px] text-slate-400">Total volume</span>
          </div>

          <div className="space-y-4">
            {CATEGORY_DEMAND_DISTRIBUTION.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{cat.label}</span>
                  <span className="font-bold text-slate-900">{cat.percentage}% ({cat.orderVolume})</span>
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
                    style={{ width: `${cat.category === 'MEAL' ? 46 : cat.category === 'SNACK' ? 24 : cat.category === 'BEVERAGE' ? 23 : 7}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>Demand Insight: </strong>Substantial meals (Rajma Chawal, Chole Chawal, Sandwiches) represent 46% of total campus appetite, followed by afternoon snacks.
          </div>
        </Card>

        {/* Student Decision Loop & Healthy Swap Opportunities */}
        <Card padding="lg" className="space-y-5 lg:col-span-2 border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Student Decision Flow &rarr; Canteen Production Opportunity
              </h3>
            </div>
            <Badge variant="emerald" size="sm">76 Swaps Accepted</Badge>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            When students scan or search for heavy fried items on EcoBite, the AI steers them toward healthier, high-margin campus meals. Below are today&apos;s top student conversion pairs:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conversion 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Initial Student Search</span>
                <span className="text-[11px] text-slate-400">188 queries</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                <span>Chole Bhature</span>
                <span className="text-slate-500">₹70 (Food Mast)</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-200">
                <span>&rarr; Converted to:</span>
                <strong className="text-slate-900">Paneer Sandwich (₹30) / Rajma Chawal (₹70)</strong>
              </div>
              <p className="text-[10px] text-slate-500">
                42 students accepted healthier meal swaps, cutting deep-fryer strain by 35%.
              </p>
            </div>

            {/* Conversion 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Top Healthy Beneficiary</span>
                <span className="text-[11px] text-emerald-600 font-bold">76 Swaps Accepted</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                <span>Paneer Sandwich</span>
                <span className="text-emerald-700">₹30 (Amul Shop)</span>
              </div>
              <div className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-200">
                <span>&rarr; Kitchen Action:</span>
                <strong className="text-slate-900">+15% Morning Batch Preparation</strong>
              </div>
              <p className="text-[10px] text-slate-500">
                High student retention and zero excess. Safest item to scale up in stock.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Aggregated Student Privacy: </strong>Student searches are aggregated anonymously into campus heatmaps. Zero personal student identity, email, or individual history is stored or displayed.
            </span>
          </div>
        </Card>
      </div>

      {/* SECTION 3: MENU INTELLIGENCE & WASTE MITIGATION TABLE */}
      <Card padding="lg" className="space-y-6 border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              MAIT Menu Intelligence & Kitchen Actions
            </h3>
            <p className="text-xs text-slate-500">
              Item-level daily prepared quantity, sold units, estimated excess, and recommended operational adjustments.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish or stall..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'MEAL', 'SNACK', 'BEVERAGE', 'DESSERT'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Items' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Dish & Stall</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price (₹)</th>
                <th className="py-3 px-3">Daily Prep vs Sold</th>
                <th className="py-3 px-3">Demand Signal</th>
                <th className="py-3 px-3">Waste Risk</th>
                <th className="py-3 px-4">Recommended Kitchen Action</th>
                <th className="py-3 px-3 text-center">In-Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const catProps = getCategoryBadgeProps(item.category);
                const prepSoldPct = Math.round((item.dailySoldQty / item.dailyPreparedQty) * 100);

                return (
                  <tr key={item.itemId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Dish Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.canteenName}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${catProps.bgClass} ${catProps.textClass}`}>
                        {catProps.label}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 font-bold text-slate-800">
                      ₹{item.price}
                    </td>

                    {/* Prep vs Sold */}
                    <td className="py-3.5 px-3 min-w-[130px]">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 mb-1">
                        <span>{item.dailySoldQty} / {item.dailyPreparedQty}</span>
                        <span className={prepSoldPct >= 90 ? 'text-emerald-600 font-bold' : prepSoldPct < 60 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {prepSoldPct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            prepSoldPct >= 90 ? 'bg-emerald-500' : prepSoldPct < 60 ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, prepSoldPct)}%` }}
                        />
                      </div>
                    </td>

                    {/* Demand Signals */}
                    <td className="py-3.5 px-3">
                      <div className="text-xs font-semibold text-slate-800">{item.searchInterest} searches</div>
                      <div className="text-[10px] text-emerald-600 font-medium">+{item.swapAcceptedCount} swaps</div>
                    </td>

                    {/* Waste Risk */}
                    <td className="py-3.5 px-3">
                      <Badge
                        variant={
                          item.wasteRisk === 'low'
                            ? 'emerald'
                            : item.wasteRisk === 'high'
                            ? 'rose'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {item.wasteRisk.toUpperCase()}
                      </Badge>
                      {item.estimatedExcessQty > 0 && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          ~{item.estimatedExcessQty} excess
                        </span>
                      )}
                    </td>

                    {/* Actionable Recommendation */}
                    <td className="py-3.5 px-4 max-w-xs text-xs text-slate-600">
                      {item.recommendation}
                    </td>

                    {/* Stock Status Toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item.itemId)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                        }`}
                        title="Click to toggle availability"
                      >
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ethical Transparency Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Ethical Data Boundary & Demonstration Scope</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Dish prices and stall allocations are 100% verified against audited MAIT physical menu board photographs. Daily prepared/sold quantities, search volume metrics, and excess estimations are demonstration sample figures. EcoBite does not claim physical sensor-based food waste detection without hardware kitchen scale or point-of-sale integrations.
          </p>
        </div>
      </Card>
    </div>
  );
};
