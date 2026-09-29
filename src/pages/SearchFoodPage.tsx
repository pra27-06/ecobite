import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FoodCard } from '../components/FoodCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { searchMockFoods } from '../data/mockFoods';
import { FOOD_CATEGORIES } from '../data/index';
import { aiService } from '../services/aiService';
import { demandService } from '../services/demandService';

export const SearchFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredFoods = useMemo(() => {
    let results = searchMockFoods(query);
    if (selectedCategory !== 'All') {
      results = results.filter((item) => item.category === selectedCategory);
    }
    return results;
  }, [query, selectedCategory]);

  const handleAnalyzeQuery = async (searchStr: string) => {
    const cleanStr = searchStr.trim();
    if (!cleanStr) return;

    // Record demand signal (SEARCH)
    demandService.recordSignal({
      campusId: 'MAIT',
      eventType: 'SEARCH',
      foodName: cleanStr,
      originalFoodName: cleanStr,
    }).catch(() => {});

    setIsAnalyzing(true);
    try {
      const resp = await aiService.analyzeFoodName(cleanStr);
      setIsAnalyzing(false);
      if (resp.success && resp.data) {
        navigate('/analysis', {
          state: { aiResult: resp.data },
        });
      } else {
        navigate(`/analysis/${encodeURIComponent(cleanStr)}`);
      }
    } catch {
      setIsAnalyzing(false);
      navigate(`/analysis/${encodeURIComponent(cleanStr)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      handleAnalyzeQuery(query);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Search Food Intelligence"
        description="Search common Indian campus meals and snacks to evaluate their nutrition, affordability benchmarks, and carbon footprint."
        badge={
          <Badge variant="emerald" size="md">
            National Database + AI
          </Badge>
        }
        showBackButton
      />

      {/* Search Input & Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Indian food (e.g. Chole Bhature, Paneer Sandwich, Rajma Chawal)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-300 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder:text-slate-400"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
            {query.trim() && (
              <Button
                variant="primary"
                size="sm"
                isLoading={isAnalyzing}
                onClick={() => handleAnalyzeQuery(query)}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                AI
              </Button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* AI Quick Query Prompt Banner */}
      {query.trim() && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">
                Analyze "{query.trim()}" with EcoBite AI
              </span>
              <p className="text-[11px] text-slate-500">
                Evaluate estimated Body, Wallet, and Planet scores for this specific dish.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            isLoading={isAnalyzing}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => handleAnalyzeQuery(query)}
            className="shrink-0"
          >
            Run AI Analysis
          </Button>
        </div>
      )}

      {/* Demo Notice */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          💡 <strong>Indian Food Knowledge Base: </strong>Search any Indian dish or cafeteria item for instant 3D evaluation.
        </span>
        <span className="font-mono text-[10px] text-slate-400 shrink-0 hidden sm:inline">
          {filteredFoods.length} foods found
        </span>
      </div>

      {/* Food Cards Grid */}
      {filteredFoods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoods.map((food) => (
            <FoodCard key={food.id} food={food} showSwapAction />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No catalog item matches"
          description={`"${query}" is not in the demo catalog, but EcoBite AI can analyze any Indian food on demand.`}
          action={
            <Button
              variant="primary"
              size="sm"
              isLoading={isAnalyzing}
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => handleAnalyzeQuery(query)}
            >
              Analyze "{query}" with AI
            </Button>
          }
        />
      )}
    </div>
  );
};

