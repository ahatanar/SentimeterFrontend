import React from 'react';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getIntensity(count) {
  if (count === 0) return 'bg-gray-200';
  if (count < 2) return 'bg-green-100';
  if (count < 4) return 'bg-green-300';
  if (count < 7) return 'bg-green-500';
  return 'bg-green-700';
}

const JournalStreakCard = ({ streakData, loading, error }) => {
  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md flex flex-col items-center animate-pulse">
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
        <div className="h-20 w-full bg-gray-100 rounded mt-4" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 bg-red-100 rounded-2xl shadow-md text-red-700">
        Error loading streak data: {error}
      </div>
    );
  }
  if (!streakData) {
    return null;
  }

  const {
    streak,
    longest_streak,
    has_written_today,
    last_entry_date,
    missed_days,
    calendar_activity = {},
  } = streakData;

  // Prepare heatmap: assume calendar_activity is { 'YYYY-MM-DD': count }
  // Show last 5 weeks (35 days)
  const today = new Date();
  const days = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key,
      count: calendar_activity[key] || 0,
      day: d.getDay(),
    });
  }

  // Group days by week
  const weeks = [];
  for (let i = 0; i < 35; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row gap-8 items-stretch">
      {/* Left: Streak Stats */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span role="img" aria-label="fire">🔥</span> Journal Streak
          </h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${has_written_today ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}> 
            {has_written_today ? (
              <>
                <span role="img" aria-label="check">✅</span> Written Today
              </>
            ) : (
              <>
                <span role="img" aria-label="cross">❌</span> Not Yet Today
              </>
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-green-600">{streak}</span>
            <span className="text-gray-600 text-sm">Current Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-blue-600">{longest_streak}</span>
            <span className="text-gray-600 text-sm">Longest Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-800">{last_entry_date ? new Date(last_entry_date).toLocaleDateString() : '-'}</span>
            <span className="text-gray-600 text-sm">Last Entry</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-800">{missed_days?.length || 0}</span>
            <span className="text-gray-600 text-sm">Missed Days</span>
          </div>
        </div>
        {missed_days?.length > 0 && (
          <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded p-2 w-full">
            <span role="img" aria-label="warning">⚠️</span> Missed days: {missed_days.slice(-5).map(d => new Date(d).toLocaleDateString()).join(', ')}{missed_days.length > 5 ? '...' : ''}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-gray-200 mx-4" />

      {/* Right: Activity Heatmap */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold mb-2">Activity Heatmap</h3>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2">
            {dayNames.map((d) => (
              <span key={d} className="text-xs text-gray-400 h-5">{d}</span>
            ))}
          </div>
          {/* Heatmap grid */}
          <div className="flex gap-1">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-1">
                {week.map((day, j) => (
                  <div
                    key={j}
                    title={`${day.date}: ${day.count} entries`}
                    className={`w-5 h-5 rounded ${getIntensity(day.count)} border border-gray-100`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalStreakCard; 