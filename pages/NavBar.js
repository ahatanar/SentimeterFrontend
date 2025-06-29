import Link from "next/link";
import { useRouter } from "next/router";
import { Home, BarChart3, Search, LogOut, Edit3 } from 'lucide-react';

const NavBar = ({ isAuthenticated, user, onLogout }) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const isActive = (path) => {
    return currentPath === path ? "bg-purple-600/20 text-purple-300" : "text-gray-300 hover:bg-blue-600/20";
  };

  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="h-8 w-8 text-purple-400" />
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Sentimeter
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/")}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isActive("/")}`}
            >
              <Home className="h-4 w-4" />
              <span>HOME</span>
            </button>

            <button
              onClick={() => router.push("/insights")}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isActive("/insights")}`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>INSIGHTS</span>
            </button>

            <button
              onClick={() => router.push("/search")}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isActive("/search")}`}
            >
              <Search className="h-4 w-4" />
              <span>SEARCH</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg text-red-300 hover:bg-red-600/20 transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>LOGOUT</span>
              </button>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`}
                className="px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors flex items-center space-x-2"
              >
                <span>Sign in with Google</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;