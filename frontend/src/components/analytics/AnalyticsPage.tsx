import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Sparkles, PieChart, Info, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { WasteAnalytics, WasteRiskPredictions } from '../../types';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<WasteAnalytics | null>(null);
  const [predictions, setPredictions] = useState<WasteRiskPredictions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [wasteData, predData] = await Promise.all([
          api.getWasteAnalytics(30),
          api.getWastePredictions(),
        ]);
        setAnalytics(wasteData);
        setPredictions(predData);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        <span className="text-xs font-medium">Loading food waste insights...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Kitchen Waste & Analytics</h2>
            <p className="text-xs text-slate-500">Track your consumption habits and prevent kitchen waste</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400">Estimated Savings</span>
          <p className="text-xl font-bold text-emerald-600">
            ${analytics?.estimated_money_saved_usd || '0.00'}
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Consumed</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{analytics?.total_consumed_items || 0}</span>
            <span className="text-xs text-slate-400 font-medium">items</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Meals prepared & eaten</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expired</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-600">{analytics?.total_expired_items || 0}</span>
            <span className="text-xs text-slate-400 font-medium">items</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Passed expiry dates</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Waste Events</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-red-600">{analytics?.total_wasted_items || 0}</span>
            <span className="text-xs text-slate-400 font-medium">items</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Discarded food portions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Waste Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800">{analytics?.waste_rate_percentage || 0}%</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Target: Under 5%</p>
        </div>
      </div>

      {/* Middle section: Category Breakdown & Most Wasted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Wasted Food Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Frequently Wasted Food Types</span>
            </h3>
            <span className="text-[11px] text-slate-400">Last 30 Days</span>
          </div>

          {analytics?.most_wasted_items && analytics.most_wasted_items.length > 0 ? (
            <div className="space-y-2.5">
              {analytics.most_wasted_items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{item.food_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-red-600">{item.quantity}</span>
                    <span className="text-[10px] text-slate-400 block">({item.wasted_times} events)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No waste records logged for this timeframe.
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-600" />
              <span>Waste Breakdown by Category</span>
            </h3>
          </div>

          {analytics?.category_breakdown && analytics.category_breakdown.length > 0 ? (
            <div className="space-y-3">
              {analytics.category_breakdown.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{cat.category_name}</span>
                    <span className="text-slate-500 font-mono">{cat.percentage_of_total_waste}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.max(5, cat.percentage_of_total_waste)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs">
              No category waste recorded.
            </div>
          )}
        </div>
      </div>

      {/* AI Food Waste Predictive Insights Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">AI Food Waste Risk Predictions</h3>
              <p className="text-xs text-slate-500">
                Evaluation based on purchasing volume, shelf-life, and consumption logs
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Model: {predictions?.model_version || 'v1.0'}
          </span>
        </div>

        {/* Prediction Cards */}
        {predictions?.items && predictions.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.items.map((item, idx) => {
              const isHigh = item.risk_level === 'High';
              const isMod = item.risk_level === 'Moderate';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isHigh
                      ? 'bg-red-50/50 border-red-200'
                      : isMod
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500">{item.category_name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-red-100 text-red-800'
                            : isMod
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.risk_level} Risk
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-800">{item.food_name}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.recommendation}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      {item.has_sufficient_data ? (
                        <span className="text-emerald-700 font-semibold">
                          Confidence: {Math.round(item.confidence_score * 100)}%
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1 font-semibold">
                          <Info className="w-3 h-3" /> Insufficient logs
                        </span>
                      )}
                    </span>
                    <span className="text-slate-400 font-mono">{item.data_points_count} logs</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            Add items to your inventory to generate waste risk insights.
          </div>
        )}
      </div>
    </div>
  );
};
