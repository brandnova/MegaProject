import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';
import RoomList from '../components/RoomList';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      {user ? <RoomList /> : <AuthForm />}
    </div>
  );
};

export default Home;