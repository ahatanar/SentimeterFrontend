import Head from "next/head";
import { useRouter } from "next/router";
import { Edit3 } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Head>
        <title>Sign In</title>
      </Head>
      <div className="w-full max-w-sm bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center flex flex-col items-center">
        <Edit3 className="h-10 w-10 text-purple-400 mb-4" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">Sentimeter</h1>
        <p className="text-lg font-medium text-gray-300 mb-6">Log in to your account</p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-transparent bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-lg font-semibold shadow hover:opacity-90 transition mb-2"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google Logo"
            className="h-5 w-5 mr-2 bg-white rounded-full"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}