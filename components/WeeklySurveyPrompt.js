import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const WeeklySurveyPrompt = ({ onTakeSurvey, className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSurvey = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BACKEND_URL}/api/weekly-surveys/check`, { withCredentials: true });
        setCompleted(res.data.completed === true);
      } catch (err) {
        setError('Could not check survey status');
      } finally {
        setLoading(false);
      }
    };
    checkSurvey();
  }, []);

  if (loading || completed) return null;

  return (
    <button
      onClick={onTakeSurvey}
      className={`flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold text-sm rounded-md border border-green-600 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400/60 active:scale-95 active:shadow-none ${className}`}
      style={{ minWidth: 0, maxWidth: 220 }}
      aria-label="Take This Week's Survey"
    >
      <Plus className="w-4 h-4" />
      <span>Take This Week's Survey</span>
    </button>
  );
};

export default WeeklySurveyPrompt; 