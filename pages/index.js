import Head from "next/head";
import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Edit3, Trash2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-900 text-white">
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

      <main className="container mx-auto px-4 py-8">
        {isAuthenticated ? (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Left Side - Streak Stats and Journal Entry */}
              <div className="xl:col-span-3 space-y-8">
                {/* Streak Stats */}
                <JournalStreakCard streakData={streakData} loading={streakLoading} error={streakError} />

                {/* Journal Entry Form */}
                <div className="bg-[#0f1729] rounded-xl border border-purple-500/20 p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-white mb-2">Welcome, {user?.name}!</h2>
                    <p className="text-2xl text-gray-400">Write Today's Journal Entry</p>
                  </div>

                  <form onSubmit={handleCreateEntry} className="space-y-4">
                    <textarea
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                      placeholder="Write about your day..."
                      className="w-full h-48 bg-[#1a1f36] border-none rounded-xl p-6 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      required
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <DatePicker
                        selected={selectedDate ? new Date(selectedDate) : null}
                        onChange={(date) => setSelectedDate(date ? date.toISOString().split('T')[0] : '')}
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Select a date"
                        className="flex-1 bg-[#1a1f36] border-none rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        calendarClassName="bg-[#1a1f36]"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {submitting ? "SUBMITTING..." : "SUBMIT ENTRY"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Recent Entries */}
                <div className="bg-[#0f1729] rounded-xl border border-purple-500/20 p-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Your Recent Journal Entries</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entries.slice(0, 12).map((entry) => (
                      <JournalEntryCard
                        key={entry.entry_id}
                        entry={entry}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Activity Heatmap */}
              <div className="xl:col-span-1">
                <ActivityHeatmap 
                  calendar_activity={streakData?.calendar_activity || {}} 
                  missed_days={streakData?.missed_days || []}
                />
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-[#1a1f36] rounded-xl border border-purple-500/20 p-6 max-w-md w-full">
                  <h3 className="text-xl font-semibold text-white mb-4">Delete Journal Entry?</h3>
                  <p className="text-gray-300 mb-6">Are you sure you want to delete this journal entry? This action cannot be undone.</p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Welcome to Sentimeter</h1>
            <p className="text-xl text-gray-300 mb-8">
              Your personal journal with sentiment analysis and mood tracking.
              Sign in to begin your journaling journey!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
