import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Tabs, Tab } from "@mui/material";
import ModernDatePicker from "../components/ModernDatePicker";
import moment from "moment";
import JournalEntryCard from "./JournalEntryCard";
import NavBar from "./NavBar";
import { Search as SearchIcon, Calendar as CalendarIcon, List as ListIcon, BookOpenText, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [user, setUser] = useState({ name: "User" });
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, false = not authed, true = authed
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch user info for NavBar
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`${BACKEND_URL}/api/auth/user-info`, { withCredentials: true });
        setUser(userResponse.data);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/signin');
    }
  }, [isAuthenticated, router]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setEntries([]);
    setCurrentPage(1);
  };

  const fetchEntriesBySemanticSearch = async () => {
    if (!searchQuery) return alert("Please enter a search query.");
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/journals/search/semantic`, {
        params: { query: searchQuery },
        withCredentials: true,
      });
      setEntries(response.data.entries || []);
    } catch (error) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntriesByKeyword = async () => {
    if (!keyword) return alert("Please enter a keyword.");
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/journals/search/keyword`, {
        params: { keyword },
        withCredentials: true,
      });
      setEntries(response.data.entries || []);
    } catch (error) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntriesByDate = async () => {
    const year = moment(date).year();
    const month = moment(date).month() + 1;
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/journals/search/date`, {
        params: { year, month },
        withCredentials: true,
      });
      setEntries(response.data.entries || []);
    } catch (error) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEntries = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/journals`, {
        params: { page: currentPage, limit: entriesPerPage },
        withCredentials: true,
      });
      setEntries(response.data.entries || []);
    } catch (error) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(entries.length / entriesPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleDeleteEntry = (entryId) => {
    setEntries(entries.filter((entry) => entry.entry_id !== entryId));
  };

  // Modern tab labels with icons
  const tabLabels = [
    { label: "Semantic Search", icon: <BookOpenText className="w-5 h-5 mr-2" /> },
    { label: "Search by Keyword", icon: <SearchIcon className="w-5 h-5 mr-2" /> },
    { label: "Search by Month/Year", icon: <CalendarIcon className="w-5 h-5 mr-2" /> },
    { label: "View All Entries", icon: <ListIcon className="w-5 h-5 mr-2" /> },
  ];

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading search...</p>
        </div>
      </div>
    );
  }
  if (isAuthenticated === false) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <NavBar isAuthenticated={isAuthenticated} user={user} onLogout={() => {}} />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <SearchIcon className="h-7 w-7 text-blue-400 mr-3" />
            Search Journal Entries
          </h2>
          <div className="mb-8">
            <div className="flex space-x-2 border-b border-purple-500/20 mb-6">
              {tabLabels.map((tab, idx) => (
                <button
                  key={tab.label}
                  onClick={() => handleTabChange(null, idx)}
                  className={`px-5 py-3 flex items-center font-semibold transition-colors rounded-t-lg focus:outline-none ${
                    activeTab === idx
                      ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-white hover:bg-blue-900/20"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div>
              {activeTab === 0 && (
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Enter a semantic search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-gray-900/60 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={fetchEntriesBySemanticSearch}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-semibold shadow hover:opacity-90 transition"
                  >
                    <BookOpenText className="w-5 h-5 inline-block mr-2" />
                    Search
                  </button>
                </div>
              )}
              {activeTab === 1 && (
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Enter keyword..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="flex-1 bg-gray-900/60 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={fetchEntriesByKeyword}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-semibold shadow hover:opacity-90 transition"
                  >
                    <SearchIcon className="w-5 h-5 inline-block mr-2" />
                    Search
                  </button>
                </div>
              )}
              {activeTab === 2 && (
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <ModernDatePicker
                    value={date}
                    onChange={setDate}
                    placeholder="Select a date"
                  />
                  <button
                    onClick={fetchEntriesByDate}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-semibold shadow hover:opacity-90 transition"
                  >
                    <CalendarIcon className="w-5 h-5 inline-block mr-2" />
                    Search
                  </button>
                </div>
              )}
              {activeTab === 3 && (
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <button
                    onClick={fetchAllEntries}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-lg font-semibold shadow hover:opacity-90 transition"
                  >
                    <ListIcon className="w-5 h-5 inline-block mr-2" />
                    Load Entries
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Results Section */}
          <div className="mt-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-purple-400 mb-4" />
                <span className="text-lg text-gray-300">Loading...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center text-gray-400 py-20 text-lg">No entries found.</div>
            ) : (
              <div className="grid gap-6">
                {(activeTab === 3
                  ? entries.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
                  : entries
                ).map((entry) => (
                  <JournalEntryCard key={entry.entry_id} entry={entry} onDelete={handleDeleteEntry} />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Pagination: Only for View All Entries tab */}
        {activeTab === 3 && entries.length > 0 && (
          <div className="flex flex-col items-center justify-center mt-8 space-y-2">
            <div className="flex justify-center items-center">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-l-lg font-semibold border border-purple-500/20 bg-black/40 text-white hover:bg-blue-900/30 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </button>
              <span className="px-6 py-2 bg-black/40 border-t border-b border-purple-500/20 text-white font-semibold">
                Page {currentPage} of {Math.ceil(entries.length / entriesPerPage)}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === Math.ceil(entries.length / entriesPerPage)}
                className={`px-4 py-2 rounded-r-lg font-semibold border border-purple-500/20 bg-black/40 text-white hover:bg-blue-900/30 transition ${currentPage === Math.ceil(entries.length / entriesPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
            </div>
            {/* Pagination selector */}
            <div className="flex flex-wrap justify-center items-center gap-1 mt-2">
              {(() => {
                const totalPages = Math.ceil(entries.length / entriesPerPage);
                const pageButtons = [];
                const maxButtons = 7; // Show up to 7 page buttons
                let start = Math.max(1, currentPage - 2);
                let end = Math.min(totalPages, currentPage + 2);
                if (currentPage <= 3) {
                  end = Math.min(totalPages, maxButtons - 2);
                }
                if (currentPage >= totalPages - 2) {
                  start = Math.max(1, totalPages - (maxButtons - 3));
                }
                // Always show first page
                if (start > 1) {
                  pageButtons.push(
                    <button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 rounded font-semibold ${currentPage === 1 ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white' : 'bg-black/40 text-white hover:bg-blue-900/30'}`}>1</button>
                  );
                  if (start > 2) pageButtons.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
                }
                for (let i = start; i <= end; i++) {
                  if (i === 1 || i === totalPages) continue; // Already rendered
                  pageButtons.push(
                    <button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 rounded font-semibold ${currentPage === i ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white' : 'bg-black/40 text-white hover:bg-blue-900/30'}`}>{i}</button>
                  );
                }
                // Always show last page
                if (end < totalPages) {
                  if (end < totalPages - 1) pageButtons.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
                  pageButtons.push(
                    <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 rounded font-semibold ${currentPage === totalPages ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white' : 'bg-black/40 text-white hover:bg-blue-900/30'}`}>{totalPages}</button>
                  );
                }
                return pageButtons;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
