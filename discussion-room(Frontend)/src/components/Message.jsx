import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Copy, Check, MessageSquare, Clock, Share2, Bookmark, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

const MAX_VISIBLE_LENGTH = 300;
const MIN_LENGTH_FOR_TRUNCATION = 400;
const COPY_FEEDBACK_DURATION = 2000;

const Message = ({ 
  message, 
  isFirstInGroup, 
  isLastInGroup, 
  isCurrentUser, 
  onCopy,
  onReply,
  onBookmark,
  onReport 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  const [copiedStates, setCopiedStates] = useState(new Map());
  const [showActions, setShowActions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const messageRef = useRef(null);
  const actionsRef = useRef(null);

  // Effect for syntax highlighting and content height measurement
  useEffect(() => {
    const measureHeight = () => {
      const content = document.getElementById(`message-content-${message.id}`);
      if (content) {
        const height = content.scrollHeight;
        setContentHeight(height);
        setShouldShowExpandButton(
          height > 150 || message.content.length > MIN_LENGTH_FOR_TRUNCATION
        );
      }
    };

    requestAnimationFrame(() => {
      Prism.highlightAll();
      measureHeight();
    });

    // Re-measure on window resize
    window.addEventListener('resize', measureHeight);
    return () => window.removeEventListener('resize', measureHeight);
  }, [message.id, message.content, isExpanded]);

  const formatTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }`;
  }, []);

  // Memoize language detection
  const detectLanguage = useCallback((code) => {
    const patterns = {
      jsx: [/import\s+React/, /jsx/, /<[\w\s]*>/],
      javascript: [/function/, /const\s+/, /let\s+/, /=>/],
      typescript: [/interface\s+/, /type\s+[A-Z]/, /<[A-Z][^>]*>/],
      python: [/def\s+/, /class\s+.*:/],
      json: [/^[\s\n]*[{[]/, /"[\w_]+"\s*:/],
      css: [/{[\s\S]*};/, /\.[a-z]/i]
    };

    for (const [language, tests] of Object.entries(patterns)) {
      if (tests.some(pattern => pattern.test(code))) {
        return language;
      }
    }
    return 'javascript';
  }, []);

  // Memoize code block processing
  const processCodeBlock = useCallback((match, code) => {
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/\&nbsp;/g, ' ');

    const language = detectLanguage(decodedCode);
    try {
      const highlightedCode = Prism.highlight(
        decodedCode,
        Prism.languages[language] || Prism.languages.javascript,
        language
      );
      return `<pre><code class="language-${language}">${highlightedCode}</code></pre>`;
    } catch (error) {
      console.error('Syntax highlighting error:', error);
      return `<pre><code class="language-${language}">${decodedCode}</code></pre>`;
    }
  }, [detectLanguage]);

  // Process message content with memoization
  const processedContent = useMemo(() => {
    const quillCodeBlockRegex = /<pre class="ql-syntax" spellcheck="false">([\s\S]*?)<\/pre>/gi;
    let processed = message.content.replace(quillCodeBlockRegex, processCodeBlock);
    return processed.split(/(<pre><code.*?<\/code><\/pre>)/g);
  }, [message.content, processCodeBlock]);

  // Handle click outside to close actions menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Preserve exact formatting when copying code
  const extractExactCode = useCallback((codeElement) => {
    // Get the original code from the data attribute we'll store
    const originalCode = codeElement.getAttribute('data-original-code');
    if (originalCode) {
      return originalCode;
    }

    // Fallback: try to reconstruct from the HTML content
    const content = codeElement.textContent || '';
    
    // Preserve indentation by looking at the HTML structure
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
      // Count leading spaces in the HTML to preserve exact indentation
      const match = line.match(/^[\s\u00A0]*/);
      const indentation = match ? match[0].length : 0;
      return ' '.repeat(indentation) + line.trim();
    });

    return processedLines.join('\n');
  }, []);

  const handleCopy = useCallback(async (text, id, isCode = false) => {
    try {
      let contentToCopy;
      
      if (isCode) {
        // For code blocks, preserve exact formatting
        const codeElement = document.querySelector(`[data-code-id="${id}"]`);
        contentToCopy = codeElement ? extractExactCode(codeElement) : text;
      } else {
        // For regular messages, clean up but preserve basic formatting
        contentToCopy = text
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p><p>/gi, '\n\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'");
      }

      await navigator.clipboard.writeText(contentToCopy);
      
      setCopiedStates(prev => new Map(prev).set(id, true));
      
      setTimeout(() => {
        setCopiedStates(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      }, COPY_FEEDBACK_DURATION);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [extractExactCode]);

  const CopyButton = useCallback(({ content, id, isCode, className }) => {
    const isCopied = copiedStates.get(id);
    
    return (
      <button
        onClick={() => handleCopy(content, id, isCode)}
        className={`${className} flex items-center gap-1 transition-all duration-200
                   hover:scale-105 active:scale-95`}
        aria-label={isCopied ? "Copied!" : "Copy to clipboard"}
      >
        {isCopied ? (
          <Check size={14} className="text-green-400" />
        ) : (
          <Copy size={14} />
        )}
      </button>
    );
  }, [copiedStates, handleCopy]);

  const MessageActions = useCallback(() => (
    <div 
      ref={actionsRef}
      className={`absolute ${isCurrentUser ? 'left-0' : 'right-0'} top-0 -mt-8
                 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full
                 shadow-lg py-1 px-2 text-gray-600 dark:text-gray-300
                 transform transition-all duration-200
                 ${showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
      
      <button 
        onClick={() => handleCopy(message.content, `message-${message.id}`)}
        className="p-1 hover:text-green-500 dark:hover:text-green-400 transition-colors"
        aria-label="Copy message"
      >
        <Copy size={14} />
      </button>
      
    </div>
  ), [showActions, isCurrentUser, message.id, handleCopy, onReply, onBookmark, onReport]);

  const renderContent = useCallback((parts) => {
    return parts.map((part, i) => {
      if (part.startsWith('<pre><code')) {
        const codeContent = part.match(/<pre><code.*?>([\s\S]*?)<\/code><\/pre>/)?.[1] || '';
        const codeId = `code-${message.id}-${i}`;
        
        return (
          <div key={i} className="relative group my-2">
            <pre className="!bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto">
              <code 
                data-code-id={codeId}
                data-original-code={codeContent}
                className="text-sm font-mono"
                dangerouslySetInnerHTML={{ __html: codeContent }}
              />
              <CopyButton
                content={codeContent}
                id={codeId}
                isCode={true}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 
                          text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 
                          transition-opacity duration-200"
              />
            </pre>
          </div>
        );
      }
      
      return (
        <div 
          key={i} 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: part }}
        />
      );
    });
  }, [message.id, CopyButton]);

  return (
    <div 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} 
                 ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}
      ref={messageRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        if (!showActions) {
          setTimeout(() => setShowActions(false), 300);
        }
      }}
    >
      <div className={`relative max-w-[85%] md:max-w-[70%] min-w-[200px] 
                      ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {isHovering && <MessageActions />}
        
        {isFirstInGroup && (
          <div className={`flex items-center space-x-2 mb-1 
                          ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {message.user.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Clock size={12} className="mr-1" />
              {formatTimestamp(message.created_at)}
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-2 shadow-sm group
            ${isCurrentUser 
              ? 'bg-blue-600 text-gray-50' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}
            ${!isLastInGroup ? 'mb-1' : 'mb-2'}
            ${isFirstInGroup && isCurrentUser ? 'rounded-tr-md' : ''}
            ${isFirstInGroup && !isCurrentUser ? 'rounded-tl-md' : ''}
            transition-all duration-200 hover:shadow-md`}
          onClick={() => setShowActions(!showActions)}
        >
          <div 
            id={`message-content-${message.id}`}
            className={`
              ${isCurrentUser ? 'prose-invert' : ''}
              relative
              transition-[max-height,opacity] duration-300 ease-in-out
              ${!isExpanded && shouldShowExpandButton ? 'max-h-[150px]' : 'max-h-none'}
              ${!isExpanded && shouldShowExpandButton ? 'overflow-hidden' : ''}
              [&_pre]:bg-[#1e1e1e] [&_pre]:rounded-lg [&_pre]:p-3 
              [&_pre]:overflow-x-auto [&_pre]:my-2
              [&_code]:font-mono [&_code]:text-sm
              [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic
              [&_pre_.token.comment]:text-gray-400
              [&_pre_.token.string]:text-green-300
              [&_pre_.token.number]:text-orange-300
              [&_pre_.token.boolean]:text-orange-300
              [&_pre_.token.keyword]:text-purple-300
              [&_pre_.token.function]:text-blue-300
              [&_pre_.token.operator]:text-gray-300
              [&_pre_.token.punctuation]:text-gray-300
              sm:text-base text-sm`}
          >
            {renderContent(processedContent)}
            {!isExpanded && shouldShowExpandButton && (
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t 
                            from-gray-300 dark:from-gray-900 to-transparent" />
            )}
          </div>
          
          {shouldShowExpandButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`text-xs mt-1 hover:underline flex items-center
                ${isCurrentUser ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}
                transition-transform duration-200 hover:scale-105`}
            >
              {isExpanded ? (
                <span className="flex items-center">Show less <ChevronLeft size={14} className="ml-1" /></span>
              ) : (
                <span className="flex items-center">Show more <ChevronRight size={14} className="ml-1" /></span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;