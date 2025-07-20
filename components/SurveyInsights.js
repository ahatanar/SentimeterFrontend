import React, { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, Moon, Heart, BarChart3, Activity, Plus, Smile, CheckCircle, Frown, Zap } from 'lucide-react';
import WeeklySurveyPrompt from './WeeklySurveyPrompt';

const SurveyInsights = ({ weeklySurveyData, onTakeSurvey }) => {
  // Multi-select for metrics
  const metricKeys = ['happiness', 'satisfaction', 'stress', 'anxiety', 'depression'];
  const [selectedMetrics, setSelectedMetrics] = useState(['happiness']);

  const metrics = {
    happiness: { color: '#10b981', label: 'Happiness', bgColor: 'bg-green-500', icon: Smile },
    satisfaction: { color: '#3b82f6', label: 'Satisfaction', bgColor: 'bg-blue-500', icon: CheckCircle },
    stress: { color: '#eab308', label: 'Stress', bgColor: 'bg-yellow-500', icon: Zap },
    anxiety: { color: '#ef4444', label: 'Anxiety', bgColor: 'bg-red-500', icon: Frown },
    depression: { color: '#a855f7', label: 'Depression', bgColor: 'bg-purple-500', icon: AlertTriangle }
  };

  // If no data, show empty state
  if (!weeklySurveyData || !weeklySurveyData.weeks || weeklySurveyData.weeks.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center text-gray-400 py-20">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-lg mb-6">Weekly survey data will appear here once you complete your first survey.</p>
          <button
            onClick={onTakeSurvey}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="inline w-4 h-4 mr-2" />
            Take Your First Survey
          </button>
        </div>
      </div>
    );
  }

  const weeklyData = weeklySurveyData.weeks;
  const computed = weeklySurveyData.computed;

  // Calculate current mood and trend
  const currentMood = (weeklyData[weeklyData.length - 1].happiness + weeklyData[weeklyData.length - 1].satisfaction) / 2;
  const previousMood = weeklyData.length > 1 ? 
    (weeklyData[weeklyData.length - 2].happiness + weeklyData[weeklyData.length - 2].satisfaction) / 2 : currentMood;
  const moodTrend = currentMood > previousMood ? 'up' : currentMood < previousMood ? 'down' : 'stable';

  const highAlerts = weeklyData.filter(week => week.urgent).length;
  const completedWeeks = weeklyData.length;
  const totalWeeks = 12; // Assuming 12 weeks period

  // Toggle metric selection, but always keep at least one selected
  const handleToggleMetric = (key) => {
    if (selectedMetrics.includes(key)) {
      if (selectedMetrics.length === 1) return; // Prevent removing last
      setSelectedMetrics(selectedMetrics.filter((k) => k !== key));
    } else {
      setSelectedMetrics([...selectedMetrics, key]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(metrics).map(([key, metric]) => (
          <div key={key} className={`flex flex-col items-center justify-center bg-black/40 rounded-xl p-4 shadow-md border border-gray-800/60 relative overflow-hidden`}>
            <metric.icon className={`w-6 h-6 mb-1`} style={{color: metric.color}} />
            <div className="text-xs text-gray-400 font-medium mb-1">Avg {metric.label}</div>
            <div className="text-xl font-bold" style={{color: metric.color}}>
              {computed && computed[`avg_${key}`] !== undefined ? computed[`avg_${key}`].toFixed(1) : 'N/A'}
            </div>
          </div>
        ))}
      </div>

      {/* Top Metrics Creative Layout */}
      <div className="grid grid-cols-5 gap-4 mb-6 items-center">
        {/* Left: Stacked */}
        <div className="col-span-1 flex flex-col gap-4 h-full">
          <div className="flex-1 bg-black/40 rounded-xl p-4 shadow border border-green-700/30 flex flex-col items-center justify-center">
            <Calendar className="w-5 h-5 text-green-400 mb-1" />
            <div className="text-xs text-gray-400">Current Streak</div>
            <div className="text-2xl font-bold text-white">{computed?.streak_weeks || 0}</div>
            <div className="text-xs text-green-400">weeks consecutive</div>
          </div>
          <div className="flex-1 bg-black/40 rounded-xl p-4 shadow border border-blue-700/30 flex flex-col items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-400 mb-1" />
            <div className="text-xs text-gray-400">Completion Rate</div>
            <div className="text-2xl font-bold text-white">
              {computed?.completion_count != null && computed?.completion_possible != null
                ? `${computed.completion_count}/${computed.completion_possible}`
                : 'N/A'}
            </div>
            <div className="text-xs text-blue-400">
              {computed?.completion_rate != null
                ? `${computed.completion_rate}% consistency`
                : ''}
            </div>
          </div>
        </div>
        {/* Center: Mood (duller, rounded rectangle) */}
        <div className="col-span-3 flex items-center justify-center">
          <div className="bg-[#181f3a] rounded-2xl shadow-lg flex flex-col items-center justify-center py-6 px-4 min-w-[200px] min-h-[140px] max-w-xs mx-auto">
            <div className="flex flex-col items-center">
              <Heart className="w-7 h-7 text-pink-400 mb-1" />
              <div className="text-xl font-bold text-white mb-1">This Week's Mood</div>
              <div className="text-3xl font-extrabold text-white mb-1">{weeklySurveyData?.average_mood?.toFixed(1) ?? '-'}</div>
              <div className="text-gray-400 mb-3 text-sm">out of 5.0</div>
              {/* Render WeeklySurveyPrompt here, only if not completed */}
              {!weeklySurveyData?.completed && (
                <WeeklySurveyPrompt onTakeSurvey={onTakeSurvey} />
              )}
            </div>
          </div>
        </div>
        {/* Right: Stacked */}
        <div className="col-span-1 flex flex-col gap-4 h-full">
          <div className="flex-1 bg-black/40 rounded-xl p-4 shadow border border-yellow-700/30 flex flex-col items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-400 mb-1" />
            <div className="text-xs text-gray-400">High Alerts (12wks)</div>
            <div className="text-2xl font-bold text-orange-400">{highAlerts}</div>
            <div className="text-xs text-gray-400">urgent flags total</div>
          </div>
        </div>
      </div>

      {/* This Week's Scores - rounded rectangle cards */}
      <div className="flex flex-row gap-4 justify-center mb-8">
        {Object.entries(metrics).map(([key, metric]) => (
          <div key={key} className={`flex flex-col items-center bg-black/40 rounded-xl px-5 py-3 shadow border border-gray-800/60 min-w-[90px] max-w-[120px]`}>
            <div className="text-lg font-bold mb-1" style={{color: metric.color}}>
              {weeklyData[weeklyData.length - 1][key]}
            </div>
            <div className="text-xs text-gray-400 mb-2">{metric.label}</div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${metric.bgColor}`}
                style={{ width: `${(weeklyData[weeklyData.length - 1][key] / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Trend Visualization */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Trend Analysis
          </h3>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Click metrics to explore</span>
          </div>
        </div>
        {/* Metric Selection Toggles */}
        <div className="flex flex-wrap gap-2 mb-6">
          {metricKeys.map((key) => {
            const Icon = metrics[key].icon;
            return (
              <button
                key={key}
                onClick={() => handleToggleMetric(key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 focus:outline-none flex items-center gap-2
                  ${selectedMetrics.includes(key)
                    ? `${metrics[key].bgColor} text-white border-transparent shadow-lg scale-105`
                    : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-700/60 hover:text-white'}
                `}
                aria-pressed={selectedMetrics.includes(key)}
                disabled={selectedMetrics.length === 1 && selectedMetrics[0] === key}
              >
                <Icon className="w-4 h-4" style={{color: selectedMetrics.includes(key) ? 'white' : metrics[key].color}} />
                {metrics[key].label}
              </button>
            );
          })}
        </div>

        {/* Legend and Current Values */}
        <div className="flex flex-wrap items-center gap-6 mb-6">
          {selectedMetrics.map((key) => {
            const Icon = metrics[key].icon;
            return (
              <div key={key} className="flex items-center gap-2 min-w-[110px]">
                <span className="inline-block w-3 h-3 rounded-full" style={{background: metrics[key].color}}></span>
                <span className="text-sm font-semibold" style={{color: metrics[key].color}}>{metrics[key].label}:</span>
                <span className="text-base font-bold" style={{color: metrics[key].color}}>{weeklyData[weeklyData.length - 1][key]}</span>
              </div>
            );
          })}
        </div>

        {/* Large Interactive Chart */}
        <div className="bg-gray-900/50 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              {selectedMetrics.length === 1
                ? `${metrics[selectedMetrics[0]].label} Over Time`
                : 'Selected Metrics Over Time'}
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis 
                  domain={[0, 5]}
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                {selectedMetrics.map((key) => (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key}
                    stroke={metrics[key].color}
                    strokeWidth={3}
                    dot={{ fill: metrics[key].color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name={metrics[key].label}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Mini Stats for Selected Metrics - Table Layout */}
          <div className="overflow-x-auto mt-6 pt-4 border-t border-gray-600/50">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-sm text-gray-400 font-medium"></th>
                  {selectedMetrics.map((key) => {
                    const Icon = metrics[key].icon;
                    return (
                      <th key={key} className="px-4 pb-2 text-base font-semibold text-left" style={{color: metrics[key].color}}>
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 rounded-full" style={{background: metrics[key].color}}></span>
                          {metrics[key].label}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-sm text-gray-400 font-medium py-1">Average</td>
                  {selectedMetrics.map((key) => (
                    <td key={key} className="font-bold text-lg py-1 text-left" style={{color: metrics[key].color}}>
                      {computed && computed[`avg_${key}`] != null ? computed[`avg_${key}`].toFixed(1) : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-sm text-gray-400 font-medium py-1">Highest</td>
                  {selectedMetrics.map((key) => (
                    <td key={key} className="font-bold text-lg py-1 text-left" style={{color: metrics[key].color}}>
                      {computed && computed[`max_${key}`] != null ? computed[`max_${key}`] : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-sm text-gray-400 font-medium py-1">Lowest</td>
                  {selectedMetrics.map((key) => (
                    <td key={key} className="font-bold text-lg py-1 text-left" style={{color: metrics[key].color}}>
                      {computed && computed[`min_${key}`] != null ? computed[`min_${key}`] : 'N/A'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sleep & Wellness Tracking */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 mt-8 shadow">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Moon className="w-5 h-5 mr-2" />
          Sleep & Wellness Tracking
        </h3>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Sleep Issues</span>
                <span className="text-sm text-gray-400">
                  {weeklyData.filter(w => w.sleep_issue).length}/{weeklyData.length} weeks
                </span>
              </div>
              <div className="flex space-x-1">
                {weeklyData.map((week, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-6 rounded ${
                      week.sleep_issue 
                        ? 'bg-red-500' 
                        : 'bg-gray-600'
                    }`}
                    title={`${week.label}: ${week.sleep_issue ? 'Sleep issues' : 'Good sleep'}`}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Urgent Flags</span>
                <span className="text-sm text-gray-400">
                  {weeklyData.filter(w => w.urgent).length}/{weeklyData.length} weeks
                </span>
              </div>
              <div className="flex space-x-1">
                {weeklyData.map((week, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-6 rounded ${
                      week.urgent 
                        ? 'bg-red-600 border-2 border-red-400' 
                        : 'bg-gray-600'
                    }`}
                    title={`${week.label}: ${week.urgent ? 'Urgent flag' : 'No concerns'}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Recent Insights:</strong> Sleep issues correlate with higher stress levels. 
                Consider establishing a consistent bedtime routine.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center mt-8">
        <button 
          onClick={onTakeSurvey}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="inline w-4 h-4 mr-2" />
          Take This Week's Survey
        </button>
      </div>
    </div>
  );
};

export default SurveyInsights; 