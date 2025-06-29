import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Tab } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import JournalEntryCard from "./JournalEntryCard";
import NavBar from "./NavBar"; // Import NavBar component

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [user, setUser] = useState({ name: "User" }); // User state for NavBar
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state for NavBar
  const [searchQuery, setSearchQuery] = useState("");

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
      console.error(error.response?.data || error.message);
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
      console.error(error.response?.data || error.message);
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
      console.error(error.response?.data || error.message);
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
      console.error(error.response?.data || error.message);
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

  const getCurrentPageEntries = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return entries.slice(startIndex, endIndex);
  };

  useEffect(() => {
    if (activeTab === 2) fetchAllEntries();

    // Fetch user data for authentication
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/user-info`, {
          withCredentials: true,
        });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error fetching user info:", error.response?.data || error.message);
      }
    };

    fetchUserData();
  }, [currentPage, activeTab]);

  const handleLogout = () => {
    document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUser({ name: "User" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Add NavBar */}
      <NavBar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />

      {/* Search Page Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Search Journal Entries</h1>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Semantic Search" />
          <Tab label="Search by Keyword" />
          <Tab label="Search by Month/Year" />
          <Tab label="View All Entries" />
          
        </Tabs>

        {activeTab === 0 && (
        <div>
          <input
            type="text"
            placeholder="Enter keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
          />
          <button
            onClick={fetchEntriesBySemanticSearch}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-500"
          >
            Search
          </button>
        </div>
      )}
        <div className="my-6">
          {activeTab === 1 && (
            <div>
              <input
                type="text"
                placeholder="Enter keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
              />
              <button
                onClick={fetchEntriesByKeyword}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-500"
              >
                Search
              </button>
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <DatePicker
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className="border border-gray-300 rounded p-2 w-full"
              />
              <button
                onClick={fetchEntriesByDate}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-500"
              >
                Search
              </button>
            </div>
          )}

          {activeTab === 3 && (
            <div>
              <button
                onClick={fetchAllEntries}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-500"
              >
                Load Entries
              </button>
            </div>
          )}
        </div>

        {loading && <p className="text-blue-600">Loading...</p>}

        <div className="mt-6">
          {entries.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                {getCurrentPageEntries().map((entry) => (
                  <JournalEntryCard
                    key={entry.entry_id}
                    entry={entry}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center mt-6">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-4"
                >
                  Previous
                </button>
                <p className="text-gray-700">
                  Page {currentPage} of {Math.ceil(entries.length / entriesPerPage)}
                </p>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === Math.ceil(entries.length / entriesPerPage)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 ml-4"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            !loading && <p>No entries found.</p>
          )}
        </div>
      </div>
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; Sentimerer. All rights reserved.</p>
      </footer>
    </div>
  );
}
