import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const ActivityHeatmap = ({ calendar_activity = {}, missed_days = [] }) => {
  // Create a 7x5 grid for the last 35 days
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  const activityGrid = dayNames.map(dayName => {
    const activity = Array(5).fill(0); // Initialize with 0s
    const dayIndex = dayNames.indexOf(dayName);
    
    // Fill in actual activity data
    for (let weekOffset = 0; weekOffset < 5; weekOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (date.getDay() - dayIndex) - (weekOffset * 7));
      const dateKey = date.toISOString().slice(0, 10);
      activity[4 - weekOffset] = calendar_activity[dateKey] || 0;
    }

    return {
      day: dayName,
      activity
    };
  });

  const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-800';
    if (count === 1) return 'bg-purple-900/50';
    if (count === 2) return 'bg-purple-600';
    return 'bg-purple-400';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="bg-[#1a1f36] rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Activity Heatmap</h3>
      </div>
      
      <div className="space-y-2">
        {activityGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center">
            <span className="text-sm text-gray-400 w-12">{row.day}</span>
            <div className="flex gap-1">
              {row.activity.map((count, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-4 h-4 rounded-sm ${getActivityColor(count)} border border-gray-700`}
                  title={`${row.day} - ${count} entries`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-gray-800 border border-gray-700" />
          <div className="w-4 h-4 rounded-sm bg-purple-900/50 border border-gray-700" />
          <div className="w-4 h-4 rounded-sm bg-purple-600 border border-gray-700" />
          <div className="w-4 h-4 rounded-sm bg-purple-400 border border-gray-700" />
        </div>
        <span>More</span>
      </div>

      {missed_days.length > 0 && (
        <div className="mt-6 p-4 bg-[#1f1d2e] rounded-lg border border-orange-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Missed Days</span>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            {missed_days.map((date, index) => (
              <div key={index}>{formatDate(date)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap; 