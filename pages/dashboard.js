import { useState, useEffect } from 'react';

const flaskBackendUrl = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL;

const Dashboard = () => {
  const [entryText, setEntryText] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      const response = await fetch(`${flaskBackendUrl}/api/journals`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          entry: entryText,
          date: date ? new Date(date).toISOString() : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Journal entry created successfully! Entry ID: ${data.entry_id}`);
        setEntryText('');
        setDate('');
      } else {
        setError(data.error || 'An error occurred while creating the journal entry.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-8">Journal Dashboard</h2>
        <ul>
          <li className="mb-4">
            <a href="#" className="block py-2 px-4 bg-blue-600 rounded-md">Create Journal Entry</a>
          </li>
          <li className="mb-4">
            <a href="#" className="block py-2 px-4 bg-gray-600 rounded-md">Placeholder Tab 1</a>
          </li>
          <li className="mb-4">
            <a href="#" className="block py-2 px-4 bg-gray-600 rounded-md">Placeholder Tab 2</a>
          </li>
          <li className="mb-4">
            <a href="#" className="block py-2 px-4 bg-gray-600 rounded-md">Placeholder Tab 3</a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-8">
        <h1 className="text-3xl font-bold mb-8">Create a New Journal Entry</h1>

        {/* Form for Creating Journal Entry */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="entry" className="block text-lg font-semibold">Your Journal Entry</label>
            <textarea
              id="entry"
              className="w-full p-4 border rounded-md"
              rows="6"
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="block text-lg font-semibold">Optional Date</label>
            <input
              type="datetime-local"
              id="date"
              className="w-full p-4 border rounded-md"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Entry'}
          </button>

          {error && <p className="mt-4 text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
