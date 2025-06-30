import { Edit3, BarChart3, Smile, Search } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-16 relative">
      {/* Subtle background visual */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
          <path fill="#a78bfa" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
      </div>
      {/* Hero Section */}
      <div className="relative z-10 bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-10 max-w-2xl w-full text-center shadow-lg">
        <Edit3 className="h-10 w-10 text-purple-400 mx-auto mb-4" />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Welcome to Sentimeter
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Your personal journal with sentiment analysis, mood tracking, and beautiful insights.
        </p>
        <a href="/signin" className="inline-block bg-gradient-to-r from-blue-400 to-purple-400 text-white px-8 py-3 rounded-lg font-semibold shadow hover:opacity-90 transition">
          Get Started
        </a>
      </div>
      {/* Feature Highlights */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl w-full">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 flex flex-col items-center text-center shadow">
          <BarChart3 className="h-8 w-8 text-blue-400 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Powerful Insights</h3>
          <p className="text-gray-300">Visualize your mood and sentiment trends with beautiful charts and heatmaps.</p>
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 flex flex-col items-center text-center shadow">
          <Smile className="h-8 w-8 text-green-400 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Mood Tracking</h3>
          <p className="text-gray-300">Track your emotional journey and discover patterns in your daily life.</p>
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 flex flex-col items-center text-center shadow">
          <Search className="h-8 w-8 text-purple-400 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
          <p className="text-gray-300">Find past entries instantly with advanced search and keyword analysis.</p>
        </div>
      </div>
    </div>
  );
} 