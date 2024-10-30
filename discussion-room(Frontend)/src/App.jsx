import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Menu, X, MessageSquare, LogOut, LogIn } from 'lucide-react';
import Home from './pages/Home';
import Chat from './pages/Chat';

const App = () => {
  const { user, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="bg-white shadow-sm relative z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold">Discussion Room</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.username}!</span>
                  <button
                    onClick={logoutUser}
                    className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 
                             text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 
                           text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <LogIn size={16} />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 
                         hover:bg-gray-100 focus:outline-none focus:ring-2 
                         focus:ring-inset focus:ring-blue-500"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-3">
              {user ? (
                <>
                  <div className="text-gray-700 px-2">
                    Welcome, {user.username}!
                  </div>
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full text-left px-2 py-2 
                             text-red-500 hover:text-red-700 rounded-lg"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 w-full px-2 py-2 
                           text-blue-500 hover:text-blue-700 rounded-lg"
                >
                  <LogIn size={16} />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:id" element={<Chat />} />
        </Routes>
      </main>

      <footer className="bg-white shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} Discussion Room. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;