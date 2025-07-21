import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, Cloud, MapPin } from 'lucide-react';

const JournalEntryCard = ({ entry, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).replace(/(\d+)(?=(,\s\d{4}))/, '$1th').split(',')[0];
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getSentimentColor = (score) => {
    if (!score) return "text-gray-400";
    const numScore = parseFloat(score);
    if (numScore <= -0.5) return "text-[#ff8080]";
    if (numScore >= 0.5) return "text-[#4ade80]/80";
    return "text-[#fbbf24]";
  };

  const getSentimentText = (sentiment, score) => {
    if (!sentiment || !score) return "neutral (0.00)";
    return `${sentiment.toLowerCase()} (${parseFloat(score).toFixed(2)})`;
  };

  const getYear = (timestamp) => {
    return new Date(timestamp).getFullYear();
  };

  return (
    <div className="bg-[#1a1f36] rounded-xl p-6 border border-purple-500/20 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-white">
            {formatDate(entry.timestamp)},
            <br />
            {getYear(entry.timestamp)}
          </h3>
          <p className={`text-lg ${getSentimentColor(entry.sentiment_score)}`}>
            Sentiment: {getSentimentText(entry.sentiment, entry.sentiment_score)}
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Pencil className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(entry.entry_id)}
            className="text-[#ff6b6b] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Analyzing indicator */}
      {entry.processing && (
        <div className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2 mt-2">
          <svg className="animate-spin h-4 w-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
          Analyzing…
        </div>
      )}
      <p className="text-gray-300 text-lg mt-4 mb-3 flex-grow">
        {isExpanded ? entry.entry : truncateText(entry.entry)}
      </p>

      {isExpanded && (
        <div className="space-y-3 mt-4 border-t border-purple-500/20 pt-4">
          {entry.weather && (
            <div className="flex items-center space-x-2 text-gray-300">
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>
                {typeof entry.weather === 'object' && entry.weather !== null
                  ? `${entry.weather.description || ''}` +
                    (entry.weather.temperature ? `, ${entry.weather.temperature}°C` : '') +
                    (entry.weather.humidity ? `, ${entry.weather.humidity}% humidity` : '') +
                    (entry.weather.wind_speed ? `, ${entry.weather.wind_speed} km/h wind` : '')
                  : entry.weather}
              </span>
            </div>
          )}
          {entry.location && (
            <div className="flex items-center space-x-2 text-gray-300">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>
                {entry.location.city || "Unknown City"}
                {entry.location.country && `, ${entry.location.country}`}
              </span>
            </div>
          )}
        </div>
      )}

      {entry.keywords && entry.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {entry.keywords.map((keyword, index) => (
            <span 
              key={index}
              className="text-sm bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalEntryCard; 