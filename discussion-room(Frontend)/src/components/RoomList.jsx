import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopics, createTopic } from '../services/api';

const RoomList = () => {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (error) {
      setError('Failed to fetch topics');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await createTopic(newTopic.title, newTopic.description);
      setNewTopic({ title: '', description: '' });
      fetchTopics();
    } catch (error) {
      setError('Failed to create topic');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Discussion Rooms</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="space-y-4">
        {topics.map((topic) => (
          <li key={topic.id} className="bg-white shadow-md rounded-lg p-4">
            <Link to={`/chat/${topic.id}`} className="block">
              <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
              <p className="text-gray-600">{topic.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-sm ${topic.is_active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {topic.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">
                  Created by: {topic.created_by.username}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Create New Topic</h3>
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newTopic.title}
              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={newTopic.description}
              onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows="3"
            ></textarea>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Topic
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomList;