import React from 'react';
import { Calendar } from 'lucide-react';

const LongestStreakCard = ({ streakData }) => {
  const { longest_streak = 0 } = streakData || {};

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 h-full">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Longest Streak</h3>
      </div>
      <div className="text-3xl font-bold text-blue-400 mb-2">{longest_streak}</div>
      <p className="text-gray-400 text-sm">Personal best</p>
    </div>
  );
};

export default LongestStreakCard; 