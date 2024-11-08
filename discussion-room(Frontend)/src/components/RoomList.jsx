import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopics, createTopic, getCurrentUser } from '../services/api';
import { 
  Search, Plus, X, Users, MessageCircle, Calendar,
  Loader2, Filter, SortAsc, SortDesc, Menu
} from 'lucide-react';

const RoomList = () => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchTopics();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    filterAndSortTopics();
  }, [topics, searchTerm, filter, sortBy]);

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const data = await getTopics();
      setTopics(data);
      setError('');
    } catch (error) {
      setError('Failed to fetch topics. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      setError('Failed to fetch user data. Please try again later.');
    }
  };

  const filterAndSortTopics = () => {
    let filtered = [...topics];

    if (searchTerm) {
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter(topic => 
        filter === 'active' ? topic.is_active : !topic.is_active
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredTopics(filtered);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await createTopic(newTopic.title, newTopic.description);
      setNewTopic({ title: '', description: '' });
      setShowCreateForm(false);
      await fetchTopics();
    } catch (error) {
      setError('Failed to create topic. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 flex w-full justify-end">
        {currentUser && currentUser.is_staff && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors sm:px-4"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Topic</span>
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-between w-full px-4 py-2 border rounded-lg bg-white"
            >
              <span className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </span>
              <Menu className="w-4 h-4" />
            </button>

            <div className={`flex flex-col sm:flex-row gap-2 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white w-full sm:w-auto"
              >
                <option value="all">All Topics</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <button
                onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                <span className="mr-2">Sort</span>
                {sortBy === 'newest' ? (
                  <SortDesc className="w-4 h-4" />
                ) : (
                  <SortAsc className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Topics List */}
        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? "Try adjusting your search terms" : "Be the first to create a topic!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/chat/${topic.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">{topic.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{topic.description}</p>
                    </div>
                    <span
                      className={`self-start px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        topic.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {topic.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{topic.created_by.username}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(topic.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Topic Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg sm:text-xl font-semibold">Create New Topic</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTopic} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter topic title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Enter topic description"
                  required
                ></textarea>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full sm:w-auto"
                >
                  Create Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;