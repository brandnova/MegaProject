import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatRoom from '../components/ChatRoom';
import { Navigate } from 'react-router-dom';

const Chat = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <ChatRoom />;
};

export default Chat;