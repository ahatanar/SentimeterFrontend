import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const JournalCollectionPage = () => {
  const [entries, setEntries] = useState([]);

  // Fetch journal entries from the backend
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/journal");
        const data = await response.json();
        setEntries(data);  // Update the state with fetched entries
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      }
    };

    fetchEntries();
  }, []);

  const handleDateClick = (info) => {
    alert(`Date clicked: ${info.dateStr}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", padding: "10px" }}>
      {/* Calendar Section */}
      <div style={{ flex: 1, marginRight: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ marginBottom: "10px" }}>Calendar</h2>
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              aspectRatio: "1 / 1", 
              overflow: "hidden",
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "10px",
              boxSizing: "border-box",
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={entries.map((entry) => ({
                title: entry.title,
                start: entry.date,  // Already formatted as YYYY-MM-DD
              }))}
              dateClick={handleDateClick}
              height="100%" // Fills the square container
              contentHeight="auto"
            />
          </div>
        </div>
      </div>

      {/* Journal Entry History */}
      <div style={{ flex: 1 }}>
        <h2>Journal Entry History</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {entries.map((entry) => (
            <li
              key={entry.id}
              style={{
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              <h3>{entry.title}</h3>
              <p>{entry.date}</p>
              <p>{entry.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JournalCollectionPage;
