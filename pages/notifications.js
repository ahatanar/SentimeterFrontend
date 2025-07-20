import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Bell, Save, Clock, Calendar, AlertCircle, CheckCircle, Home, BarChart3, Search, LogOut, Edit3 } from 'lucide-react';
import NavBar from "./NavBar";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Notifications() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "User" });
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [settings, setSettings] = useState({
    journal_enabled: false,
    journal_frequency: 'daily',
    journal_time: '20:00',
    journal_day: 'monday'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`${BACKEND_URL}/api/auth/user-info`, {
          withCredentials: true,
        });
        setUser(userResponse.data);
        setIsAuthenticated(true);

        // Fetch notification settings
        const settingsResponse = await axios.get(`${BACKEND_URL}/api/notifications/settings`, {
          withCredentials: true,
          params: { _t: Date.now() } // Cache busting
        });
        
        console.log('Settings response:', settingsResponse.data);
        
        if (settingsResponse.data) {
          const savedSettings = settingsResponse.data.settings;
          console.log('Parsed settings:', savedSettings);
          setSettings({
            journal_enabled: savedSettings.journal_enabled ?? false,
            journal_frequency: savedSettings.journal_frequency || 'daily',
            journal_time: savedSettings.journal_time || '20:00',
            journal_day: savedSettings.journal_day || 'monday'
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error.response?.data || error.message);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/signin');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateTimeFormat = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleSaveSettings = async () => {
    if (!validateTimeFormat(settings.journal_time)) {
      setMessage({ type: 'error', text: 'Please enter a valid time in HH:MM format (24-hour)' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Saving settings:', settings);
      const response = await axios.post(`${BACKEND_URL}/api/notifications/settings`, settings, {
        withCredentials: true,
      });
      console.log('Save response:', response.data);
      setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
      
      // Refresh settings after saving to confirm they were saved
      // Add a small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const refreshResponse = await axios.get(`${BACKEND_URL}/api/notifications/settings`, {
        withCredentials: true,
        params: { _t: Date.now() } // Cache busting
      });
      console.log('Refresh response:', refreshResponse.data);
      
      if (refreshResponse.data) {
        const savedSettings = refreshResponse.data.settings;
        console.log('Parsed refresh settings:', savedSettings);
        setSettings({
          journal_enabled: savedSettings.journal_enabled ?? false,
          journal_frequency: savedSettings.journal_frequency || 'daily',
          journal_time: savedSettings.journal_time || '20:00',
          journal_day: savedSettings.journal_day || 'monday'
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'Failed to save settings';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };



  const handleLogout = () => {
    document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUser({ name: "User" });
  };

  if (isAuthenticated === null || (loading && isAuthenticated !== false)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <NavBar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Notification Settings
          </h2>
          <p className="text-gray-300 text-lg">Manage your journal reminder preferences</p>
        </div>

        {/* Settings Form */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8">
          <div className="space-y-6">
            {/* Enable Journal Reminders */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Enable Journal Reminders</h3>
                  <p className="text-gray-400 text-sm">Receive email reminders to write in your journal</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.journal_enabled}
                  onChange={(e) => handleInputChange('journal_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Frequency Selection */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="h-6 w-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Reminder Frequency</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">How often would you like to receive reminders?</p>
              <select
                value={settings.journal_frequency}
                onChange={(e) => handleInputChange('journal_frequency', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Day of Week Selection - Only show when Weekly */}
            {settings.journal_frequency === 'weekly' && (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-6 w-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Day of Week</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">Which day of the week should reminders be sent?</p>
                <select
                  value={settings.journal_day}
                  onChange={(e) => handleInputChange('journal_day', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
            )}

            {/* Time Selection */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Reminder Time</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">What time should reminders be sent? (24-hour format)</p>
              <input
                type="time"
                value={settings.journal_time}
                onChange={(e) => handleInputChange('journal_time', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="20:00"
              />
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-900/20 border-green-500/50 text-green-300' 
                  : 'bg-red-900/20 border-red-500/50 text-red-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
} 