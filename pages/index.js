import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Eye, Edit3, Trash2 } from 'lucide-react';
import ModernDatePicker from "../components/ModernDatePicker";
import JournalEntryCard from "../components/JournalEntryCard";
import NavBar from "./NavBar";
import JournalStreakCard from './JournalStreakCard';
import ActivityHeatmap from './ActivityHeatmap';
import About from '../components/About';
import WeeklySurveyPrompt from '../components/WeeklySurveyPrompt';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const pollIntervalMs = 3000;
const maxPolls = 20;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ name: "User" });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dateValue, setDateValue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [location, setLocation] = useState(null);
  const pollRefs = useRef({}); // Track polling intervals by entry_id

  const handleLogout = () => {
    document.cookie = "access_token_cookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUser({ name: "User" });
    setEntries([]);
  };

  // Helper to get location (returns a Promise)
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve(null);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            });
          },
          (err) => {
            resolve(null); // If denied or error, just resolve null
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      }
    });
  };

  // Helper: Start polling for a single entry by ID
  const startPollingEntry = (entry_id) => {
    let pollCount = 0;
    if (pollRefs.current[entry_id]) return; // Already polling
    pollRefs.current[entry_id] = setInterval(async () => {
      pollCount++;
      // Polling request removed for now. Add retry logic here later if needed.
      if (pollCount >= maxPolls) {
        clearInterval(pollRefs.current[entry_id]);
        delete pollRefs.current[entry_id];
      }
    }, pollIntervalMs);
  };

  // Clean up polling if entry is deleted
  useEffect(() => {
    return () => {
      Object.values(pollRefs.current).forEach(clearInterval);
      pollRefs.current = {};
    };
  }, []);

  // Start polling for any entries with processing: true on mount or entries change
  useEffect(() => {
    entries.forEach((entry) => {
      if (entry.processing) startPollingEntry(entry.entry_id);
    });
  }, [entries]);

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
      // Try to get location before submitting
      const loc = await getLocation();
      setLocation(loc); // Save for possible UI use
      const requestBody = {
        entry: journalEntry,
        date: selectedDate || undefined,
      };
      if (loc) {
        requestBody.location = loc;
      }
      const response = await axios.post(
        `${BACKEND_URL}/api/journals`,
        requestBody,
        { withCredentials: true }
      );

      const newEntryData = response.data.entry;
      if (newEntryData && newEntryData.entry_id) {
        setEntries([newEntryData, ...entries.slice(0, 11)]);
        if (newEntryData.processing) startPollingEntry(newEntryData.entry_id);
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
      
      // Clean up polling for deleted entry
      if (pollRefs.current[entryToDelete]) {
        clearInterval(pollRefs.current[entryToDelete]);
        delete pollRefs.current[entryToDelete];
      }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
        <NavBar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <About />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Sentimeter - Journal App</title>
        {/* No custom styles needed for react-tailwindcss-datepicker */}
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
                      <ModernDatePicker
                        value={dateValue}
                        onChange={(date) => {
                          setDateValue(date);
                          setSelectedDate(date ? date.toISOString().split('T')[0] : "");
                        }}
                        placeholder="Select a date"
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
