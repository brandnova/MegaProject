import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ChatRoom = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await getMessages(id);
      setMessages(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to fetch messages. Please try again later.');
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await sendMessage(id, newMessage);
        setNewMessage('');
        fetchMessages();
        setError(null);
      } catch (error) {
        console.error('Failed to send message:', error);
        setError('Failed to send message. Please try again.');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      ['link', 'image'],
      [{ 'align': [] }, { 'background': [] }],
      ['code-block'],
    ],
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 flex flex-col h-[calc(100vh-6rem)]">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.user.id === user.id ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.user.id === user.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300'
              }`}
            >
              <p className="font-bold">{message.user.username}</p>
              <div dangerouslySetInnerHTML={{ __html: message.content }} />
              <p className="text-xs mt-1">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mb-4">
        <ReactQuill
          value={newMessage}
          onChange={setNewMessage}
          modules={modules}
          placeholder="Type your message..."
        />
      </div>
      <button
        onClick={handleSendMessage}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default ChatRoom;