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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export default function Insights() {
  const [heatmapData, setHeatmapData] = useState({});
  const [sentimentData, setSentimentData] = useState({ last_month: [], last_week: [], last_year: [] });
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        console.log("Fetching heatmap data...");
        const heatmapResponse = await axios.get(`${BACKEND_URL}/api/journals/heatmap`, {
          withCredentials: true,
        });
        console.log("Heatmap data received:", heatmapResponse.data);
        setHeatmapData(heatmapResponse.data);

        console.log("Fetching sentiment data...");
        const sentimentResponse = await axios.get(`${BACKEND_URL}/api/journals/sentiments`, {
          withCredentials: true,
        });
        console.log("Sentiment data received:", sentimentResponse.data);
        setSentimentData(sentimentResponse.data);

        console.log("Fetching top keywords...");
        const keywordsResponse = await axios.get(`${BACKEND_URL}/api/journals/keywords?top_n=10`, {
          withCredentials: true,
        });
        console.log("Keywords data received:", keywordsResponse.data.keywords);
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Insights</h1>
      {loading ? (
        <p>Loading insights...</p>
      ) : (
        <>
          {/* Heatmap Section */}
          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Activity Heatmap</h2>
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
          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Last Month Sentiments</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentData.last_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week_label" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                {/* Background Coloring for Sentiments */}
                <ReferenceArea y1={-1} y2={-0.5} fill="red" fillOpacity={0.2} />
                <ReferenceArea y1={-0.5} y2={0.5} fill="yellow" fillOpacity={0.2} />
                <ReferenceArea y1={0.5} y2={1} fill="green" fillOpacity={0.2} />
                <Line type="monotone" dataKey="average_sentiment" stroke="#000" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Last Week Sentiments</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentData.last_week}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                {/* Background Coloring for Sentiments */}
                <ReferenceArea y1={-1} y2={-0.5} fill="red" fillOpacity={0.2} />
                <ReferenceArea y1={-0.5} y2={0.5} fill="yellow" fillOpacity={0.2} />
                <ReferenceArea y1={0.5} y2={1} fill="green" fillOpacity={0.2} />
                <Line type="monotone" dataKey="average_sentiment" stroke="#000" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Last Year Sentiments</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentData.last_year}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                {/* Background Coloring for Sentiments */}
                <ReferenceArea y1={-1} y2={-0.5} fill="red" fillOpacity={0.2} />
                <ReferenceArea y1={-0.5} y2={0.5} fill="yellow" fillOpacity={0.2} />
                <ReferenceArea y1={0.5} y2={1} fill="green" fillOpacity={0.2} />
                <Line type="monotone" dataKey="average_sentiment" stroke="#000" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Keywords Section */}
          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Top Keywords</h2>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={transformKeywordsData(keywords)} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
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
        </>
      )}
    </div>
  );
}
