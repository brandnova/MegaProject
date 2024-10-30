import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage, getTopic } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Message from './Message';
import ReactQuill from 'react-quill';
import { 
  Send, 
  ChevronDown, 
  Calendar,
  MessageCircle,
  Info,
} from 'lucide-react';
import Prism from 'prismjs';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast';


const ChatRoom = () => {
  // All hooks declared at the top level
  const { id } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [topic, setTopic] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTopicInfo, setShowTopicInfo] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ],
  };

  useEffect(() => {
    if (messages.length > lastMessageCount) {
      const isScrolledToBottom = 
        chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop 
        <= chatContainerRef.current.clientHeight + 100;

      if (isScrolledToBottom) {
        scrollToBottom();
      } else {
        setHasNewMessages(true);
      }
      setLastMessageCount(messages.length);
    }
    Prism.highlightAll();
  }, [messages, lastMessageCount]);

  const fetchTopic = async () => {
    try {
      const topicData = await getTopic(id);
      setTopic(topicData);
    } catch (error) {
      console.error('Failed to fetch topic:', error);
      setError('Failed to fetch topic details.');
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await getMessages(id);
      if (data.length !== messages.length) {
        setMessages(data);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to fetch messages. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([fetchTopic(), fetchMessages()]);
    };
    fetchInitialData();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (messages.length > lastMessageCount) {
      // Check if the new message is from the current user
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.user.id === user.id) {
        scrollToBottom();
      }
      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount, user.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const scrolledUp = scrollHeight - scrollTop - clientHeight > 200; // Show button when scrolled up more than 200px
      setShowScrollButton(scrolledUp);
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setIsLoading(true);
      try {
        await sendMessage(id, newMessage);
        setNewMessage('');
        await fetchMessages();
        scrollToBottom(); // Auto-scroll only after sending a message
        setError(null);
      } catch (error) {
        setError('Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };


  const copyMessageToClipboard = (content) => {
    // Remove HTML tags when copying
    const textContent = content.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(textContent).then(() => {
      toast.success('Message copied to clipboard');
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast.error('Failed to copy message');
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold">{topic?.title || 'Loading...'}</h2>
                <button 
                  onClick={() => setShowTopicInfo(!showTopicInfo)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Info size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center space-x-1">
                  <MessageCircle size={14} />
                  <span>{messages.length} messages</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Created {topic ? formatDate(topic.created_at) : '...'}</span>
                </div>
              </div>
            </div>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Topic Info Panel */}
        {showTopicInfo && topic && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created by:</span>{' '}
                  {topic.created_by.username}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    topic.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {topic.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-gradient-to-b from-gray-50 to-white scroll-smooth"
      >
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isFirstInGroup={index === 0 || messages[index - 1].user.id !== message.user.id}
            isLastInGroup={index === messages.length - 1 || messages[index + 1].user.id !== message.user.id}
            isCurrentUser={message.user.id === user.id}
            onCopy={copyMessageToClipboard}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 
                     bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg
                     hover:bg-blue-700 transition-colors duration-200 ease-in-out
                     flex items-center space-x-2 z-10"
        >
          <span>Scroll to Bottom</span>
          <ChevronDown size={16} />
        </button>
      )}

      {/* Message Input */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <ReactQuill
            value={newMessage}
            onChange={setNewMessage}
            modules={modules}
            placeholder="Type your message..."
            className="bg-white rounded-lg mb-2 [&_.ql-toolbar]:border-gray-200 
                       [&_.ql-container]:border-gray-200 [&_.ql-editor]:min-h-[100px]
                       [&_.ql-editor]:max-h-[200px] [&_.ql-editor]:overflow-y-auto
                       [&_.ql-editor]:text-gray-700 [&_.ql-editor]:text-sm
                       [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:rounded-t-lg
                       [&_.ql-container]:rounded-b-lg"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !newMessage.trim()}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg
                ${isLoading || !newMessage.trim() 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors duration-200`}
            >
              <span>Send</span>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;