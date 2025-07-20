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
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-md transition-all duration-150 ${className}`}
      style={{ minWidth: 0, maxWidth: 340 }}
      aria-label="Take This Week's Survey"
    >
      <Plus className="w-5 h-5" />
      <span>Take This Week's Survey</span>
    </button>
  );
};

export default WeeklySurveyPrompt; 