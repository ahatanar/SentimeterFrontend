import Head from "next/head";
import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Edit3, Trash2, BarChart3, Smile, Search } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import JournalEntryCard from "./JournalEntryCard";
import NavBar from "./NavBar";
import JournalStreakCard from './JournalStreakCard';
import ActivityHeatmap from './ActivityHeatmap';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ name: "User" });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const handleLogout = () => {
    document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUser({ name: "User" });
    setEntries([]);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`${BACKEND_URL}/api/auth/user-info`, {
          withCredentials: true,
        });
        if (userResponse?.data) {
          setUser(userResponse.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error fetching user info:", error.response?.data || error.message);
        setIsAuthenticated(false);
      }

      try {
        const entriesResponse = await axios.get(`${BACKEND_URL}/api/journals/recent`, {
          withCredentials: true,
        });
        if (entriesResponse?.data && Array.isArray(entriesResponse.data)) {
          setEntries(entriesResponse.data);
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.error("Error fetching entries:", error.response?.data || error.message);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchStreak = async () => {
      setStreakLoading(true);
      setStreakError(null);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/journals/streak`, { withCredentials: true });
        setStreakData(response.data);
      } catch (error) {
        setStreakError(error.response?.data?.error || 'Failed to fetch streak data');
      } finally {
        setStreakLoading(false);
      }
    };

    fetchUserData();
    fetchStreak();
  }, []);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!journalEntry.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/journals`,
        {
          entry: journalEntry,
          date: selectedDate || undefined,
        },
        { withCredentials: true }
      );

      const newEntryData = response.data.entry;
      if (newEntryData && newEntryData.entry_id) {
        setEntries([newEntryData, ...entries.slice(0, 11)]);
        setJournalEntry("");
        setSelectedDate("");
        
        // Refresh streak data after new entry
        const streakResponse = await axios.get(`${BACKEND_URL}/api/journals/streak`, { withCredentials: true });
        setStreakData(streakResponse.data);
      }
    } catch (error) {
      console.error("Error creating journal entry:", error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (entryId) => {
    setEntryToDelete(entryId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      await axios.delete(`${BACKEND_URL}/api/journals/${entryToDelete}`, {
        withCredentials: true,
      });
      setEntries((prevEntries) => prevEntries.filter((entry) => entry.entry_id !== entryToDelete));
      
      // Refresh streak data after deletion
      const streakResponse = await axios.get(`${BACKEND_URL}/api/journals/streak`, { withCredentials: true });
      setStreakData(streakResponse.data);
    } catch (error) {
      console.error("Error deleting entry:", error.response?.data || error.message);
    } finally {
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEntryToDelete(null);
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return "text-gray-400";
    if (sentiment === "Positive") return "text-green-400";
    if (sentiment === "Negative") return "text-red-400";
    return "text-yellow-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <NavBar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4" />
            <div className="h-32 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Head>
        <title>Sentimeter - Journal App</title>
        <style>{`
          .react-datepicker {
            background-color: #1a1f36;
            border: 1px solid rgba(168, 85, 247, 0.2);
            border-radius: 0.75rem;
            font-family: inherit;
          }
          .react-datepicker__header {
            background-color: #151929;
            border-bottom: 1px solid rgba(168, 85, 247, 0.2);
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;
            padding-top: 1rem;
          }
          .react-datepicker__month {
            background-color: #1a1f36;
            margin: 0.4rem;
            text-align: center;
          }
          .react-datepicker__day-name, .react-datepicker__day {
            color: #fff;
            margin: 0.2rem;
            width: 2rem;
            height: 2rem;
            line-height: 2rem;
            border-radius: 0.5rem;
          }
          .react-datepicker__day:hover {
            background-color: rgba(168, 85, 247, 0.2);
          }
          .react-datepicker__day--selected {
            background-color: #6366f1 !important;
            color: white !important;
          }
          .react-datepicker__day--keyboard-selected {
            background-color: rgba(168, 85, 247, 0.4);
          }
          .react-datepicker__day--outside-month {
            color: #6b7280;
          }
          .react-datepicker__current-month {
            color: #fff;
            font-weight: bold;
            font-size: 1rem;
            margin-bottom: 0.5rem;
          }
          .react-datepicker__navigation {
            top: 1rem;
          }
          .react-datepicker__navigation-icon::before {
            border-color: #fff;
          }
          .react-datepicker__day--today {
            font-weight: bold;
            color: #6366f1;
          }
        `}</style>
      </Head>

      <NavBar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />

      <main className="flex flex-col items-center justify-center flex-1 px-4 py-16 relative">
        {/* Subtle background visual */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
            <path fill="#a78bfa" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
        </div>
        {/* Hero Section */}
        <div className="relative z-10 bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-10 max-w-2xl w-full text-center shadow-lg">
          <Edit3 className="h-10 w-10 text-purple-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Welcome to Sentimeter
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Your personal journal with sentiment analysis, mood tracking, and beautiful insights.
          </p>
          <a href="/signin" className="inline-block bg-gradient-to-r from-blue-400 to-purple-400 text-white px-8 py-3 rounded-lg font-semibold shadow hover:opacity-90 transition">
            Get Started
          </a>
        </div>
        {/* Feature Highlights */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl w-full">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 flex flex-col items-center text-center shadow">
            <BarChart3 className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Powerful Insights</h3>
            <p className="text-gray-300">Visualize your mood and sentiment trends with beautiful charts and heatmaps.</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 flex flex-col items-center text-center shadow">
            <Smile className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Mood Tracking</h3>
            <p className="text-gray-300">Track your emotional journey and discover patterns in your daily life.</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 flex flex-col items-center text-center shadow">
            <Search className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
            <p className="text-gray-300">Find past entries instantly with advanced search and keyword analysis.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
