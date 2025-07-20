import React from 'react';
import { Calendar, Brain, Target, Zap, Activity, Home, BarChart3, Search, LogOut, Edit3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

const JournalInsights = ({ 
  heatmapData, 
  sentimentData, 
  keywords, 
  avgSentiment, 
  totalEntries, 
  mostActiveDay, 
  topKeyword 
}) => {
  // Prepare data for react-calendar-heatmap
  const today = new Date();
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);
  const values = Object.entries(heatmapData).map(([date, count]) => ({ date, count }));

  // Custom color scale for dark GitHub style
  const classForValue = (value) => {
    if (!value || value.count === 0) return "color-empty";
    if (value.count === 1) return "color-github-1";
    if (value.count === 2) return "color-github-2";
    if (value.count === 3) return "color-github-3";
    return "color-github-4";
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Brain className="h-8 w-8 text-blue-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-400">Avg Sentiment</h3>
              <p className="text-2xl font-bold text-blue-400">{avgSentiment.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Activity className="h-8 w-8 text-green-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-400">Total Entries</h3>
              <p className="text-2xl font-bold text-green-400">{totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Target className="h-8 w-8 text-purple-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-400">Most Active</h3>
              <p className="text-2xl font-bold text-purple-400">{mostActiveDay}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="h-8 w-8 text-yellow-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-400">Top Keyword</h3>
              <p className="text-2xl font-bold text-yellow-400">{topKeyword}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-style Activity Heatmap */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 mb-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-purple-400" />
          <span>Activity Heatmap</span>
        </h3>
        <div className="flex flex-col items-center">
          <CalendarHeatmap
            startDate={lastYear}
            endDate={today}
            values={values}
            classForValue={classForValue}
            showWeekdayLabels={true}
            tooltipDataAttrs={value => ({
              'data-tip': value && value.date ? `${value.date}: ${value.count} entries` : 'No data',
            })}
          />
          {/* Legend */}
          <div className="mt-6 flex items-center space-x-2 text-sm text-gray-400">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-4 h-4 rounded-sm color-empty border border-gray-700" />
              <div className="w-4 h-4 rounded-sm color-github-1 border border-gray-700" />
              <div className="w-4 h-4 rounded-sm color-github-2 border border-gray-700" />
              <div className="w-4 h-4 rounded-sm color-github-3 border border-gray-700" />
              <div className="w-4 h-4 rounded-sm color-github-4 border border-gray-700" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Last Month Sentiments</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sentimentData.last_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week_label" stroke="#9CA3AF" fontSize={12} />
              <YAxis domain={[-1, 1]} stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #6366F1',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="average_sentiment" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Last Week Sentiments</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sentimentData.last_week}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
              <YAxis domain={[-1, 1]} stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #3B82F6',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="average_sentiment" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Last Year Sentiments</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sentimentData.last_year}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis domain={[-1, 1]} stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #10B981',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="average_sentiment" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Target className="h-6 w-6 text-purple-400" />
          <span>Top Keywords</span>
        </h3>
        {keywords.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">No keyword data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={keywords.map(([keyword, frequency]) => ({ keyword, frequency }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
              <YAxis dataKey="keyword" type="category" stroke="#9CA3AF" fontSize={12} width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Bar 
                dataKey="frequency" 
                fill="url(#bluePurpleGradient)"
                radius={[0, 4, 4, 0]}
              />
              <defs>
                <linearGradient id="bluePurpleGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="60%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default JournalInsights; 