import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Chat from './pages/Chat';

const App = () => {
  const { user, logoutUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Discussion Room</span>
              </Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <>
                  <span className="mr-4">Welcome, {user.username}!</span>
                  <button
                    onClick={logoutUser}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:id" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;