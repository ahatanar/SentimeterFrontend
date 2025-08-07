import React from 'react';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { formatDateTimeLocal } from '../utils/dateUtils';

const JournalStreakCard = ({ streakData, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1a1f36] rounded-xl border border-purple-500/20 p-6 animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4 w-2/3" />
            <div className="h-10 bg-gray-700 rounded mb-2 w-1/3" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20 p-6">
        <p className="text-red-400">Error loading streak data: {error}</p>
      </div>
    );
  }

  if (!streakData) return null;

  const {
    streak,
    longest_streak,
    has_written_today,
    last_entry_date,
    missed_days = []
  } = streakData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Current Streak */}
      <div className="bg-[#1a1f36] rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Current Streak</h3>
          </div>
          <div className={`px-3 py-1 ${has_written_today ? 'bg-green-500/20' : 'bg-purple-500/20'} rounded-full`}>
            <span className={`text-sm font-medium ${has_written_today ? 'text-green-400' : 'text-purple-300'}`}>
              {has_written_today ? 'Active' : 'Write Today'}
            </span>
          </div>
        </div>
        <div className="text-3xl font-bold text-green-400 mb-2">{streak || 0}</div>
        <p className="text-gray-400 text-sm">Keep it going!</p>
      </div>

      {/* Longest Streak */}
      <div className="bg-[#1a1f36] rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Longest Streak</h3>
        </div>
        <div className="text-3xl font-bold text-blue-400 mb-2">{longest_streak || 0}</div>
        <p className="text-gray-400 text-sm">Personal best</p>
      </div>

      {/* Missed Days */}
      <div className="bg-[#1a1f36] rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Missed Days</h3>
        </div>
        <div className="text-3xl font-bold text-orange-400 mb-2">{missed_days.length}</div>
        <p className="text-gray-400 text-sm">
          Last entry: {last_entry_date ? formatDateTimeLocal(last_entry_date) : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default JournalStreakCard; 