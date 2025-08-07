import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;



export default function WeeklySurveyModal({ isOpen, onClose, onSurveyComplete }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  
  // Survey form state - matches database model
  const [surveyData, setSurveyData] = useState({
    stress: 3,
    anxiety: 3,
    depression: 3,
    happiness: 3,
    satisfaction: 3,
    self_harm_thoughts: false,
    significant_sleep_issues: false
  });

  // Generate available weeks (last 8 weeks that don't have surveys)
  useEffect(() => {
    if (isOpen) {
      generateAvailableWeeks();
    }
  }, [isOpen]);

  const generateAvailableWeeks = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      
      // Get Monday of that week
      const dayOfWeek = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      
      const weekStart = monday.toISOString().split('T')[0];
      const weekEnd = new Date(monday);
      weekEnd.setDate(monday.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      weeks.push({
        week_start: weekStart,
        week_end: weekEndStr,
        label: `${weekStart} → ${weekEndStr}`
      });
    }
    
    setAvailableWeeks(weeks);
    setSelectedWeek(weeks[0]); // Default to current week
  };

  // Helper to format week label as 'Mon, Jul 14 – Sun, Jul 20'
  function formatWeekLabel(week, idx) {
    const start = new Date(week.week_start + 'T00:00:00');
    const end = new Date(week.week_end + 'T00:00:00');
    const startStr = format(start, 'EEE, MMM d');
    const endStr = format(end, 'EEE, MMM d');
    if (idx === 0) {
      return `This week: ${startStr} – ${endStr}`;
    }
    return `${startStr} – ${endStr}`;
  }

  const handleInputChange = (field, value) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedWeek) {
      setMessage({ type: 'error', text: 'Please select a week for your survey.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${BACKEND_URL}/api/weekly-surveys`, {
        ...surveyData,
        week_start: selectedWeek.week_start
      }, {
        withCredentials: true
      });
      
      setMessage({ type: 'success', text: 'Weekly survey submitted successfully!' });
      
      // Reset form
      setSurveyData({
        stress: 3,
        anxiety: 3,
        depression: 3,
        happiness: 3,
        satisfaction: 3,
        self_harm_thoughts: false,
        significant_sleep_issues: false
      });
      
      // Call callback to refresh insights
      if (onSurveyComplete) {
        onSurveyComplete();
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting survey:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'Failed to submit survey';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-purple-500/20 p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Weekly Survey</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Week Selection */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Which week are you rating?</h3>
          </div>
          <select
            value={selectedWeek?.week_start || ''}
            onChange={(e) => {
              const week = availableWeeks.find(w => w.week_start === e.target.value);
              setSelectedWeek(week);
            }}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {availableWeeks.map((week, idx) => (
              <option key={week.week_start} value={week.week_start}>
                {formatWeekLabel(week, idx)}
              </option>
            ))}
          </select>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slider Questions - 1-5 Likert scales (sliders) */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">How stressed were you this week?</label>
              <input
                type="range"
                min="1"
                max="5"
                value={surveyData.stress}
                onChange={(e) => handleInputChange('stress', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider slider-stress"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Not at all</span>
                <span className="text-white font-medium">{surveyData.stress}/5</span>
                <span>Extremely</span>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">How anxious were you this week?</label>
              <input
                type="range"
                min="1"
                max="5"
                value={surveyData.anxiety}
                onChange={(e) => handleInputChange('anxiety', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider slider-anxiety"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Not at all</span>
                <span className="text-white font-medium">{surveyData.anxiety}/5</span>
                <span>Extremely</span>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">How depressed did you feel this week?</label>
              <input
                type="range"
                min="1"
                max="5"
                value={surveyData.depression}
                onChange={(e) => handleInputChange('depression', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider slider-depression"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Not at all</span>
                <span className="text-white font-medium">{surveyData.depression}/5</span>
                <span>Extremely</span>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">How happy were you this week?</label>
              <input
                type="range"
                min="1"
                max="5"
                value={surveyData.happiness}
                onChange={(e) => handleInputChange('happiness', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider slider-happiness"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Not at all</span>
                <span className="text-white font-medium">{surveyData.happiness}/5</span>
                <span>Extremely</span>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">How satisfied were you with your life this week?</label>
              <input
                type="range"
                min="1"
                max="5"
                value={surveyData.satisfaction}
                onChange={(e) => handleInputChange('satisfaction', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider slider-satisfaction"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Not at all</span>
                <span className="text-white font-medium">{surveyData.satisfaction}/5</span>
                <span>Extremely</span>
              </div>
            </div>
          </div>

          {/* Toggle Questions - High-signal booleans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div>
                <h4 className="text-white font-medium">Did you experience thoughts of self-harm this week?</h4>
                <p className="text-gray-400 text-sm">This information is kept private and secure</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={surveyData.self_harm_thoughts}
                  onChange={(e) => handleInputChange('self_harm_thoughts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div>
                <h4 className="text-white font-medium">Did you experience significant sleep issues this week?</h4>
                <p className="text-gray-400 text-sm">Difficulty falling/staying asleep, poor sleep quality</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={surveyData.significant_sleep_issues}
                  onChange={(e) => handleInputChange('significant_sleep_issues', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-900/20 border-green-500/50 text-green-300' 
                : 'bg-red-900/20 border-red-500/50 text-red-300'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>{submitting ? 'Submitting...' : 'Submit Survey'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
        /* Stress - yellow */
        .slider-stress::-webkit-slider-thumb { background: #eab308; }
        .slider-stress::-moz-range-thumb { background: #eab308; }
        .slider-stress::-ms-thumb { background: #eab308; }
        .slider-stress::-webkit-slider-thumb { border-color: #eab308; }
        .slider-stress::-moz-range-thumb { border-color: #eab308; }
        .slider-stress::-ms-thumb { border-color: #eab308; }
        .slider-stress::-webkit-slider-runnable-track { background: #eab30833; }
        .slider-stress::-moz-range-track { background: #eab30833; }
        .slider-stress::-ms-fill-lower { background: #eab30833; }
        /* Anxiety - red */
        .slider-anxiety::-webkit-slider-thumb { background: #ef4444; }
        .slider-anxiety::-moz-range-thumb { background: #ef4444; }
        .slider-anxiety::-ms-thumb { background: #ef4444; }
        .slider-anxiety::-webkit-slider-thumb { border-color: #ef4444; }
        .slider-anxiety::-moz-range-thumb { border-color: #ef4444; }
        .slider-anxiety::-ms-thumb { border-color: #ef4444; }
        .slider-anxiety::-webkit-slider-runnable-track { background: #ef444433; }
        .slider-anxiety::-moz-range-track { background: #ef444433; }
        .slider-anxiety::-ms-fill-lower { background: #ef444433; }
        /* Depression - purple */
        .slider-depression::-webkit-slider-thumb { background: #a855f7; }
        .slider-depression::-moz-range-thumb { background: #a855f7; }
        .slider-depression::-ms-thumb { background: #a855f7; }
        .slider-depression::-webkit-slider-thumb { border-color: #a855f7; }
        .slider-depression::-moz-range-thumb { border-color: #a855f7; }
        .slider-depression::-ms-thumb { border-color: #a855f7; }
        .slider-depression::-webkit-slider-runnable-track { background: #a855f733; }
        .slider-depression::-moz-range-track { background: #a855f733; }
        .slider-depression::-ms-fill-lower { background: #a855f733; }
        /* Happiness - green */
        .slider-happiness::-webkit-slider-thumb { background: #10b981; }
        .slider-happiness::-moz-range-thumb { background: #10b981; }
        .slider-happiness::-ms-thumb { background: #10b981; }
        .slider-happiness::-webkit-slider-thumb { border-color: #10b981; }
        .slider-happiness::-moz-range-thumb { border-color: #10b981; }
        .slider-happiness::-ms-thumb { border-color: #10b981; }
        .slider-happiness::-webkit-slider-runnable-track { background: #10b98133; }
        .slider-happiness::-moz-range-track { background: #10b98133; }
        .slider-happiness::-ms-fill-lower { background: #10b98133; }
        /* Satisfaction - blue */
        .slider-satisfaction::-webkit-slider-thumb { background: #3b82f6; }
        .slider-satisfaction::-moz-range-thumb { background: #3b82f6; }
        .slider-satisfaction::-ms-thumb { background: #3b82f6; }
        .slider-satisfaction::-webkit-slider-thumb { border-color: #3b82f6; }
        .slider-satisfaction::-moz-range-thumb { border-color: #3b82f6; }
        .slider-satisfaction::-ms-thumb { border-color: #3b82f6; }
        .slider-satisfaction::-webkit-slider-runnable-track { background: #3b82f633; }
        .slider-satisfaction::-moz-range-track { background: #3b82f633; }
        .slider-satisfaction::-ms-fill-lower { background: #3b82f633; }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
} 