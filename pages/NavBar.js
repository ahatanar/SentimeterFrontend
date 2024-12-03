import Link from "next/link";
import { Button } from "@mui/material";
import { useRouter } from "next/router";

const NavBar = ({ isAuthenticated, user, onLogout }) => {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between p-4 bg-blue-600 text-white">
      <div className="font-bold text-xl">
        <Link href="/">Sentimeter</Link>
      </div>
      <div className="flex items-center">
        {isAuthenticated ? (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/")}
              className="mr-2"
            >
              Home
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/insights")}
              className="mr-2"
            >
              Insights
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/search")}
              className="mr-2"
            >
              Search
            </Button>
            <Button onClick={onLogout} variant="contained" color="error">
              Logout
            </Button>
          </>
        ) : (
          <Button onClick={() => (window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`)} variant="contained" color="primary">
            Sign in with Google
          </Button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;