import Head from "next/head";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import { TextField, Button, CircularProgress } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import JournalEntryCard from "./JournalEntryCard"; // Import your custom JournalEntryCard component

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ name: "User" });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState(""); // State for new journal entry
  const [selectedDate, setSelectedDate] = useState(null); // State for date picker
  const [submitting, setSubmitting] = useState(false); // Track form submission state
  const router = useRouter();

  // Redirect user to the backend login endpoint
  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/login`;
  };

  // Log the user out by clearing the cookie and resetting state
  const handleLogout = () => {
    document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUser({ name: "User" });
    setEntries([]);
    router.push("/");
  };

  // Fetch user data and recent entries
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

    fetchUserData();
  }, []);

  // Handle submission of a new journal entry
  const handleCreateEntry = async () => {
    if (!newEntry.trim()) return; // Prevent empty submission

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/journals`,
        {
          entry: newEntry,
          date: selectedDate ? selectedDate.toISOString() : undefined,
        },
        { withCredentials: true }
      );

      // Log the full response for debugging
      console.log("Response from backend:", response.data);

      // Ensure response contains valid data
      const newEntryData = response.data.entry;
      if (newEntryData && newEntryData.entry_id) {
        setEntries([newEntryData, ...entries.slice(0, 11)]); // Add new entry and limit to 12
        setNewEntry(""); // Clear input
        setSelectedDate(null); // Reset date picker
      } else {
        console.error("Invalid entry structure or entry_id is missing:", response.data);
      }
    } catch (error) {
      console.error("Error creating journal entry:", error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete entry
  const handleDeleteEntry = (entryId) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.entry_id !== entryId));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Head>
        <title>Journal App</title>
      </Head>

      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <div className="font-bold text-xl">
          <Link href="/">Journal App</Link>
        </div>
        <div>
          {!isAuthenticated ? (
            <Button onClick={handleLogin} variant="contained" color="warning">
              Login with Google
            </Button>
          ) : (
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.name || "User"}!</span>
              <Button onClick={handleLogout} variant="contained" color="error">
                Logout
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Section */}
      <main className="flex flex-col items-center flex-grow py-10 px-6">
        {isAuthenticated ? (
          <>
            <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || "User"}!</h1>
            <h2 className="text-2xl font-semibold mb-4">Write Today's Journal Entry</h2>
            <TextField
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              label="Write about your day..."
              multiline
              rows={4}
              fullWidth
              className="mb-4"
              variant="outlined"
            />
            <div className="flex items-center mb-6">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MMMM d, yyyy"
                className="border border-gray-300 rounded p-2"
                placeholderText="Select a date (optional)"
              />
              <Button
                onClick={handleCreateEntry}
                variant="contained"
                color="primary"
                disabled={submitting}
                className="ml-4"
              >
                {submitting ? <CircularProgress size={24} /> : "Submit Entry"}
              </Button>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Your Recent Journal Entries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(entries) && entries.length > 0 ? (
                entries.slice(0, 12).map((entry) => (
                  <JournalEntryCard
                    key={entry.entry_id}
                    entry={entry}
                    onDelete={handleDeleteEntry} // Pass the delete handler here
                  />
                ))
              ) : (
                <p className="text-gray-600">No recent entries found.</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Welcome to Journal App</h1>
            <p className="text-gray-700 max-w-3xl mx-auto mb-6">
              Start capturing your thoughts, tracking your moods, and gaining insights into your journey.
              Sign in to begin your journaling adventure!
            </p>
            <Button onClick={handleLogin} variant="contained" color="primary">
              Sign in with Google
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; 2024 Journal App. All rights reserved.</p>
      </footer>
    </div>
  );
}
