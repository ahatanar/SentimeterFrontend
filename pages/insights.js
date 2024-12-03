import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  ReferenceArea,
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import NavBar from "./NavBar";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Insights() {
  const [heatmapData, setHeatmapData] = useState({});
  const [sentimentData, setSentimentData] = useState({ last_month: [], last_week: [], last_year: [] });
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: "User" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        // Fetch user info for authentication
        const userResponse = await axios.get(`${BACKEND_URL}/api/auth/user-info`, {
          withCredentials: true,
        });
        setUser(userResponse.data);
        setIsAuthenticated(true);

        // Fetch heatmap data
        const heatmapResponse = await axios.get(`${BACKEND_URL}/api/journals/heatmap`, {
          withCredentials: true,
        });
        setHeatmapData(heatmapResponse.data);

        // Fetch sentiment data
        const sentimentResponse = await axios.get(`${BACKEND_URL}/api/journals/sentiments`, {
          withCredentials: true,
        });
        setSentimentData(sentimentResponse.data);

        // Fetch keywords data
        const keywordsResponse = await axios.get(`${BACKEND_URL}/api/journals/keywords?top_n=10`, {
          withCredentials: true,
        });
        setKeywords(keywordsResponse.data.keywords);
      } catch (error) {
        console.error("Error fetching insights data:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsightsData();
  }, []);

  const transformHeatmapData = (data) =>
    Object.entries(data).map(([date, count]) => ({ date, count }));

  const transformKeywordsData = (data) =>
    data.map(([keyword, frequency]) => ({ keyword, frequency }));

  const handleLogout = () => {
    document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUser({ name: "User" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navigation Bar */}
      <NavBar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />

      {/* Insights Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Insights</h1>
        {loading ? (
          <p className="text-center text-gray-500">Loading insights...</p>
        ) : (
          <div className="grid gap-8">
            {/* Activity Heatmap */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">Activity Heatmap</h2>
              <CalendarHeatmap
                startDate={new Date(new Date().setDate(new Date().getDate() - 365))}
                endDate={new Date()}
                values={transformHeatmapData(heatmapData)}
                classForValue={(value) => {
                  if (!value || value.count === 0) return "color-empty";
                  if (value.count === 1) return "color-scale-1";
                  if (value.count === 2) return "color-scale-2";
                  return "color-scale-3";
                }}
                tooltipDataAttrs={(value) => ({
                  "data-tip": value?.date
                    ? `${value.date}: ${value.count} activities`
                    : "No data",
                })}
                showWeekdayLabels={true}
              />
            </div>

            {/* Sentiments Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {["last_month", "last_week", "last_year"].map((timeframe, index) => (
                <div
                  key={timeframe}
                  className="bg-white shadow-md rounded-lg p-6"
                >
                  <h2 className="text-xl font-bold mb-4 text-center">
                    {`${
                      timeframe === "last_month"
                        ? "Last Month"
                        : timeframe === "last_week"
                        ? "Last Week"
                        : "Last Year"
                    } Sentiments`}
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={sentimentData[timeframe]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey={timeframe === "last_year" ? "month" : timeframe === "last_week" ? "day" : "week_label"}
                        interval={0}
                        tickFormatter={timeframe === "last_year" ? (month) => month.slice(0, 3).toLowerCase() : undefined} // Shorten to 3 letters
                        angle={-90} 
                        textAnchor="end" 
                      />
                      <YAxis domain={[-1, 1]} />
                      <Tooltip />
                      <ReferenceArea y1={-1} y2={-0.5} fill="red" fillOpacity={0.2} />
                      <ReferenceArea y1={-0.5} y2={0.5} fill="yellow" fillOpacity={0.2} />
                      <ReferenceArea y1={0.5} y2={1} fill="green" fillOpacity={0.2} />
                      <Line type="monotone" dataKey="average_sentiment" stroke="#000" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>

            {/* Keywords Bar Chart */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">Top Keywords</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={transformKeywordsData(keywords)}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="keyword" width={150} />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#8884d8">
                    <LabelList dataKey="frequency" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; Sentimerer. All rights reserved.</p>
      </footer>
    </div>
  );
}
