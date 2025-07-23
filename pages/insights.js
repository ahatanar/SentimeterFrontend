import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Calendar, TrendingUp, Clock, AlertCircle, Home, BarChart3, Search, LogOut, Edit3, Brain, Target, Zap, Activity, Plus } from 'lucide-react';
import NavBar from "./NavBar";
import TabSwitcher from "../components/TabSwitcher";
import JournalInsights from "../components/JournalInsights";
import SurveyInsights from "../components/SurveyInsights";
import WeeklySurveyModal from "./WeeklySurveyModal";
import WeeklySurveyPrompt from "../components/WeeklySurveyPrompt";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Insights() {
  const router = useRouter();
  const [heatmapData, setHeatmapData] = useState({});
  const [sentimentData, setSentimentData] = useState({ last_month: [], last_week: [], last_year: [] });
  const [keywords, setKeywords] = useState([]);
  const [weeklySurveyData, setWeeklySurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: "User" });
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, false = not authed, true = authed
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        // Fetch user info for authentication
        const userResponse = await axios.get(`${BACKEND_URL}/api/auth/user-info`, {
          withCredentials: true,
        });
        setUser(userResponse.data);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setLoading(false);
        return; 
      }

      try {
        const heatmapResponse = await axios.get(`${BACKEND_URL}/api/journals/heatmap`, { withCredentials: true });
        setHeatmapData(heatmapResponse.data);
      } catch (error) {
        console.log('Heatmap data not available:', error.message);
      }

      try {
        const sentimentResponse = await axios.get(`${BACKEND_URL}/api/journals/sentiments`, { withCredentials: true });
        setSentimentData(sentimentResponse.data);
      } catch (error) {
        console.log('Sentiment data not available:', error.message);
      }

      try {
        const keywordsResponse = await axios.get(`${BACKEND_URL}/api/journals/keywords?top_n=10`, { withCredentials: true });
        setKeywords(keywordsResponse.data.keywords);
      } catch (error) {
        console.log('Keywords data not available:', error.message);
      }
        
      // Fetch weekly survey data
      try {
        const surveyResponse = await axios.get(`${BACKEND_URL}/api/weekly-surveys/summary?weeks=12`, { withCredentials: true });
        setWeeklySurveyData(surveyResponse.data);
      } catch (error) {
        console.log('Weekly survey data not available yet:', error.message);
      }

      setLoading(false);
    };
    fetchInsightsData();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/signin');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null || (loading && isAuthenticated !== false)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading insights...</p>
        </div>
      </div>
    );
  }
  if (isAuthenticated === false) {
    return null; // Will redirect
  }

  const transformKeywordsData = (data) =>
    data.map(([keyword, frequency]) => ({ keyword, frequency }));

  const handleLogout = () => {
    document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUser({ name: "User" });
  };

  const handleSurveyComplete = async () => {
    // Refresh weekly survey data after completion
    try {
      const surveyResponse = await axios.get(`${BACKEND_URL}/api/weekly-surveys/summary?weeks=12`, { withCredentials: true });
      setWeeklySurveyData(surveyResponse.data);
    } catch (error) {
      console.log('Error refreshing survey data');
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'journal',
      label: 'Journal Insights',
      icon: Edit3
    },
    {
      id: 'survey',
      label: 'Survey Insights',
      icon: TrendingUp
    }
  ];

  // Calculate insights from real data
  const avgSentiment = sentimentData.last_month.length > 0 
    ? sentimentData.last_month.reduce((acc, item) => acc + item.average_sentiment, 0) / sentimentData.last_month.length 
    : 0;
  
  const totalEntries = Object.values(heatmapData).reduce((acc, count) => acc + count, 0);
  
  // Calculate most active day of the week
  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  Object.entries(heatmapData).forEach(([date, count]) => {
    const day = new Date(date).getDay(); // 0 (Sun) - 6 (Sat)
    weekdayTotals[day] += count;
  });
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const maxTotal = Math.max(...weekdayTotals);
  const mostActiveDay = maxTotal > 0 ? weekdays[weekdayTotals.indexOf(maxTotal)] : 'N/A';
  
  const topKeyword = keywords.length > 0 ? keywords[0]?.[0] || 'N/A' : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation Bar */}
      <NavBar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Insights Dashboard
          </h2>
          <p className="text-gray-300 text-lg">Discover patterns in your journaling journey</p>
        </div>

        {/* Tab Switcher */}
        <TabSwitcher 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Content based on active tab */}
        {activeTab === 'journal' && (
          <JournalInsights 
            heatmapData={heatmapData}
            sentimentData={sentimentData}
            keywords={keywords}
            avgSentiment={avgSentiment}
            totalEntries={totalEntries}
            mostActiveDay={mostActiveDay}
            topKeyword={topKeyword}
          />
        )}

        {activeTab === 'survey' && (
          <SurveyInsights 
            weeklySurveyData={weeklySurveyData}
            onTakeSurvey={() => setSurveyModalOpen(true)}
          />
        )}
      </div>
      
      {/* Weekly Survey Modal */}
      <WeeklySurveyModal
        isOpen={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        onSurveyComplete={handleSurveyComplete}
      />
      
      {/* Custom dark GitHub heatmap colors */}
      <style jsx global>{`
        .color-empty { fill: #23272e !important; background: #23272e !important; }
        .color-github-1 { fill: #a7f3d0 !important; background: #a7f3d0 !important; }
        .color-github-2 { fill: #6ee7b7 !important; background: #6ee7b7 !important; }
        .color-github-3 { fill: #34d399 !important; background: #34d399 !important; }
        .color-github-4 { fill: #059669 !important; background: #059669 !important; }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          fill: #9ca3af;
          font-size: 12px;
          text-anchor: middle;
          dominant-baseline: middle;
          alignment-baseline: middle;
          transform: none;
        }
        .react-calendar-heatmap text { fill: #9ca3af; font-size: 12px; }
        .react-calendar-heatmap .react-calendar-heatmap-month-label { fill: #9ca3af; font-size: 12px; }
        .react-calendar-heatmap rect {
          rx: 3px;
          ry: 3px;
        }
      `}</style>
    </div>
  );
}
