import React, { useState } from "react";
import axios from "axios";
import moment from "moment";

const BACKEND_URL = "http://127.0.0.1:5000";

const JournalEntryCard = ({ entry, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => moment(dateString).format("MMMM Do, YYYY");

  const truncateContent = (content, length) =>
    content.length > length ? `${content.substring(0, length)}...` : content;

  const getSentimentColor = (sentimentScore) => {
    const score = parseFloat(sentimentScore);
    if (score < -0.5) return "bg-red-100 border-red-300";
    if (score >= -0.5 && score <= 0.5) return "bg-yellow-100 border-yellow-300";
    return "bg-green-100 border-green-300";
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/journals/${entry.entry_id}`, {
        withCredentials: true,
      });
      onDelete(entry.entry_id);
    } catch (error) {
      console.error("Error deleting entry:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-4 border rounded shadow-sm ${getSentimentColor(
        entry.sentiment_score
      )} transition-all`}
    >
      {/* Display Key Information */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-800 font-semibold">{formatDate(entry.timestamp)}</p>
          <p className="text-sm text-gray-500">
            Sentiment: {entry.sentiment} ({parseFloat(entry.sentiment_score).toFixed(2)})
          </p>
          <p className="mt-2 text-gray-700">
            {expanded
              ? entry.entry
              : truncateContent(entry.entry, 50)}
          </p>
          {!expanded && entry.keywords.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              <strong>Top Keyword:</strong> {entry.keywords[0]}
            </p>
          )}
        </div>
        {/* Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <button
            onClick={handleDelete}
            className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Weather:</strong> {entry.weather || "No weather data available"}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Keywords:</strong>{" "}
            {entry.keywords.length > 0
              ? entry.keywords.slice(0, 3).join(", ")
              : "No keywords available"}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Location:</strong> {entry.location.city}, {entry.location.country}
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalEntryCard;
