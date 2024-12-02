import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Tab } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import JournalEntryCard from "./journalEntryCard"; // Component for rendering each entry

const BACKEND_URL = "http://127.0.0.1:5000";

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const entriesPerPage = 10; // Number of entries to display per page

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setEntries([]);
    setCurrentPage(1); // Reset to the first page
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
    const month = moment(date).month() + 1; // Month is 0-indexed in JS
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

  // Get the entries for the current page
  const getCurrentPageEntries = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return entries.slice(startIndex, endIndex);
  };

  useEffect(() => {
    if (activeTab === 2) fetchAllEntries(); // Fetch entries when the "View All Entries" tab is active
  }, [currentPage, activeTab]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search Journal Entries</h1>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Search by Keyword" />
        <Tab label="Search by Month/Year" />
        <Tab label="View All Entries" />
      </Tabs>

      <div className="my-6">
        {activeTab === 0 && (
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

        {activeTab === 1 && (
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

        {activeTab === 2 && (
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
  );
}
