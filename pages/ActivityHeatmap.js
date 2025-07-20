import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const ActivityHeatmap = ({ calendar_activity = {}, missed_days = [] }) => {
  // Always treat date keys as UTC (YYYY-MM-DD)
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  // Build a 5-week grid (rows: weeks, cols: days)
  const grid = [];
  for (let week = 4; week >= 0; week--) {
    const row = [];
    for (let day = 0; day < 7; day++) {
      // Calculate the date for this cell in UTC
      const cellDate = new Date(todayUTC);
      cellDate.setUTCDate(cellDate.getUTCDate() - (week * 7) - (cellDate.getUTCDay() - day));
      const dateKey = cellDate.toISOString().slice(0, 10); // YYYY-MM-DD
      row.push({
        dateKey,
        count: calendar_activity[dateKey] || 0,
        missed: missed_days.includes(dateKey),
        day,
        week,
        cellDate
      });
    }
    grid.push(row);
  }

  // Helper: is this missed day in the last 7 days?
  function isRecentMissed(dateKey) {
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const cellDate = new Date(dateKey + 'T00:00:00Z');
    const diff = (todayUTC - cellDate) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  }

  const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-800';
    if (count === 1) return 'bg-purple-900/50';
    if (count === 2) return 'bg-purple-600';
    return 'bg-purple-400';
  };

  const formatDate = (dateStr) => {
    // Always display as UTC
    return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  // Helper: get month label for a date
  function getMonthLabel(date) {
    return date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  }

  // Find which weeks start a new month
  const monthLabels = [];
  let lastMonth = null;
  for (let i = 0; i < grid.length; i++) {
    const firstCell = grid[i][0];
    const month = getMonthLabel(firstCell.cellDate);
    if (month !== lastMonth) {
      monthLabels[i] = month;
      lastMonth = month;
    } else {
      monthLabels[i] = '';
    }
  }

  return (
    <div className="bg-[#1a1f36] rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Activity Heatmap</h3>
      </div>

      {/* Days of week header - aligned with grid */}
      <div className="flex mb-3 justify-center">
        <div style={{ width: 36 }} />
        <div className="flex gap-1">
          {dayNames.map((day, idx) => (
            <div
              key={idx}
              className="text-base text-gray-400 text-center font-semibold flex items-center justify-center"
              style={{ width: 24, minWidth: 24 }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid with month labels */}
      <div className="space-y-1 mb-4 flex flex-col items-center">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center">
            {/* Month label at the start of the row */}
            <div className="text-sm text-gray-400 font-bold text-right pr-2 flex items-center justify-end" style={{ width: 36, minWidth: 36 }}>
              {monthLabels[rowIdx]}
            </div>
            <div className="flex gap-1">
              {row.map((cell, colIdx) => {
                // Highlight missed days anywhere in the grid
                const isMissed = cell.missed;
                const isRecent = isMissed && isRecentMissed(cell.dateKey);
                let cellClass = getActivityColor(cell.count) + ' border ';
                if (isMissed) {
                  if (isRecent) {
                    cellClass = 'bg-red-600 border-red-500 shadow shadow-red-500/40 text-white animate-pulse-fast';
                  } else {
                    cellClass = 'bg-red-900 border-red-700 text-white opacity-80';
                  }
                } else {
                  cellClass += 'border-gray-700';
                }
                return (
                  <div
                    key={colIdx}
                    className={`rounded-sm relative group transition-all duration-150 flex items-center justify-center ${cellClass}`}
                    style={{ width: 24, height: 24, minWidth: 24, minHeight: 24 }}
                    title={`${formatDate(cell.dateKey)}\n${cell.count} entr${cell.count === 1 ? 'y' : 'ies'}${isMissed ? (isRecent ? '\nMissed (last 7 days)' : '\nMissed (earlier)') : ''}`}
                  >
                    {/* Missed day icon */}
                    {isMissed && (
                      isRecent ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                        </span>
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center opacity-60">
                          <svg width="11" height="11" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend - right under the calendar */}
      <div className="flex justify-center">
        <div className="flex items-center text-base text-gray-400 gap-2">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 rounded-sm bg-gray-800 border border-gray-700" />
            <div className="w-4 h-4 rounded-sm bg-purple-900/50 border border-gray-700" />
            <div className="w-4 h-4 rounded-sm bg-purple-600 border border-gray-700" />
            <div className="w-4 h-4 rounded-sm bg-purple-400 border border-gray-700" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      {/* Missed days indicator - properly formatted */}
      <div className="flex justify-center mt-3">
        <div className="flex items-center text-base text-gray-400 gap-2">
          <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span>Missed (last 7 days)</span>
        </div>
      </div>

      {missed_days.length > 0 && (
        <div className="mt-6 p-4 bg-[#1f1d2e] rounded-lg border border-orange-500/20 max-w-xs mx-auto">
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
      
      <style jsx>{`
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default ActivityHeatmap; 