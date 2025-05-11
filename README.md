# News Chatbot Frontend

This is the frontend for a RAG-powered chatbot that answers queries about news articles. It provides a clean and intuitive interface for interacting with the chatbot.

## Tech Stack

- **React** for the UI
- **Tailwind CSS** for styling
- **Socket.io-client** for real-time communication with the backend
- **Axios** for HTTP requests
- **React Markdown** for rendering markdown in responses

## Features

- Real-time chat interface with streaming responses
- Dark/light mode toggle
- Message history display
- Session management
- Responsive design
- Voice input (where supported by the browser)
- Markdown rendering for rich text responses

## Setup

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Create a `.env` file based on `.env.example` and set your backend API URL
4. Start the development server:
   \`\`\`
   npm start
   \`\`\`

## Environment Variables

- `REACT_APP_API_URL`: URL of the backend API (default: http://localhost:5000)

## Detailed Implementation

### 1. Frontend Architecture

The React application is structured with the following components:

- **App.js**: Main component that manages the chat state and socket connection
- **ChatMessage.js**: Renders individual chat messages with markdown support
- **ChatInput.js**: Provides an input field for sending messages with voice input support
- **Header.js**: Displays the application header with theme toggle and session controls
- **TypingIndicator.js**: Shows a typing animation when the AI is generating a response

### 2. Socket.io Integration

The frontend connects to the backend using Socket.io for real-time communication:

\`\`\`javascript
// From App.js
useEffect(() => {
  // Initialize socket connection
  const newSocket = io(API_URL);
  setSocket(newSocket);
  
  // Clean up on unmount
  return () => {
    newSocket.disconnect();
  };
}, []);
\`\`\`

It sets up event listeners for various socket events:

\`\`\`javascript
// From App.js
socket.on("chat message", (message) => {
  setMessages((prevMessages) => [...prevMessages, message]);
});

socket.on("chat chunk", ({ text, timestamp }) => {
  setMessages((prevMessages) => {
    // Find if we already have a partial message with this timestamp
    const messageIndex = prevMessages.findIndex(
      (msg) => msg.role === "assistant" && msg.timestamp === timestamp
    );

    if (messageIndex >= 0) {
      // Update existing message
      const updatedMessages = [...prevMessages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: updatedMessages[messageIndex].content + text,
      };
      return updatedMessages;
    } else {
      // Create new message
      return [
        ...prevMessages,
        {
          role: "assistant",
          content: text,
          timestamp,
          isPartial: true,
        },
      ];
    }
  });
});

socket.on("chat complete", (message) => {
  setMessages((prevMessages) => {
    // Remove any partial messages with this timestamp
    const filteredMessages = prevMessages.filter(
      (msg) => !(msg.role === "assistant" && msg.timestamp === message.timestamp && msg.isPartial)
    );
    // Add the complete message
    return [...filteredMessages, message];
  });
  setLoading(false);
});

socket.on("typing", (status) => {
  setIsTyping(status);
});
\`\`\`

### 3. Handling Streaming Responses

The frontend handles streaming responses by updating the UI in real-time as chunks are received:

1. When a user sends a message, the frontend emits a `chat message` event to the backend:

\`\`\`javascript
// From App.js
const sendMessage = (message) => {
  if (!socket || !message.trim() || loading) return;
  
  setLoading(true);
  socket.emit("chat message", { message, sessionId });
};
\`\`\`

2. The backend starts generating a streaming response and emits `chat chunk` events for each chunk:

3. The frontend receives these chunks and updates the UI:

\`\`\`javascript
// From App.js
socket.on("chat chunk", ({ text, timestamp }) => {
  setMessages((prevMessages) => {
    // Find if we already have a partial message with this timestamp
    const messageIndex = prevMessages.findIndex(
      (msg) => msg.role === "assistant" && msg.timestamp === timestamp
    );

    if (messageIndex >= 0) {
      // Update existing message
      const updatedMessages = [...prevMessages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: updatedMessages[messageIndex].content + text,
      };
      return updatedMessages;
    } else {
      // Create new message
      return [
        ...prevMessages,
        {
          role: "assistant",
          content: text,
          timestamp,
          isPartial: true,
        },
      ];
    }
  });
});
\`\`\`

4. When the response is complete, the backend emits a `chat complete` event:

5. The frontend finalizes the message:

\`\`\`javascript
// From App.js
socket.on("chat complete", (message) => {
  setMessages((prevMessages) => {
    // Remove any partial messages with this timestamp
    const filteredMessages = prevMessages.filter(
      (msg) => !(msg.role === "assistant" && msg.timestamp === message.timestamp && msg.isPartial)
    );
    // Add the complete message
    return [...filteredMessages, message];
  });
  setLoading(false);
});
\`\`\`

### 4. Session Management

The frontend manages user sessions using localStorage:

\`\`\`javascript
// From App.js
useEffect(() => {
  // Get or create session ID
  const storedSessionId = localStorage.getItem("chatSessionId");
  const newSessionId = storedSessionId || uuidv4();
  
  if (!storedSessionId) {
    localStorage.setItem("chatSessionId", newSessionId);
  }
  
  setSessionId(newSessionId);
  
  // ...
}, []);
\`\`\`

When a user joins, the frontend emits a `join` event to the backend:

\`\`\`javascript
// From App.js
socket.emit("join", sessionId);
\`\`\`

The frontend fetches the chat history for the session:

\`\`\`javascript
// From App.js
const fetchChatHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/history/${sessionId}`);
    setMessages(response.data.history);
  } catch (error) {
    console.error("Error fetching chat history:", error);
  }
};
\`\`\`

### 5. Theme Management

The frontend supports both light and dark themes:

\`\`\`javascript
// From App.js
const toggleTheme = () => {
  const newTheme = theme === "light" ? "dark" : "light";
  setTheme(newTheme);
  localStorage.setItem("theme", newTheme);
  document.documentElement.classList.toggle("dark", newTheme === "dark");
};
\`\`\`

The theme preference is stored in localStorage:

\`\`\`javascript
// From App.js
// Check for theme preference
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);
document.documentElement.classList.toggle("dark", savedTheme === "dark");
\`\`\`

### 6. Voice Input

The frontend supports voice input where available:

\`\`\`javascript
// From ChatInput.js
useEffect(() => {
  if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    
    recognitionInstance.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setMessage(transcript);
    };
    
    setRecognition(recognitionInstance);
  }
}, []);
\`\`\`

## Components

### App.js
The main component that manages the chat state and socket connection.

\`\`\`javascript
function App() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [theme, setTheme] = useState("light");
  
  // ... (socket setup, event handlers, etc.)
  
  return (
    <div className={`flex flex-col h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} transition-colors duration-200`}>
      <Header clearSession={clearSession} loading={loading} theme={theme} toggleTheme={toggleTheme} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Messages or welcome screen */}
        {isTyping && <TypingIndicator theme={theme} />}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput sendMessage={sendMessage} loading={loading} theme={theme} />
    </div>
  );
}
\`\`\`

### ChatMessage.js
Renders individual chat messages with markdown support.

\`\`\`javascript
function ChatMessage({ message, theme }) {
  const { role, content, timestamp } = message;
  const isUser = role === "user";
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>
      <div className={/* styling based on role and theme */}>
        <div className={`prose prose-sm max-w-none ${theme === "dark" ? "prose-invert" : ""}`}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div className={/* timestamp styling */}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
\`\`\`

### ChatInput.js
Provides an input field for sending messages with voice input support.

\`\`\`javascript
function ChatInput({ sendMessage, loading, theme }) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // ... (voice recognition setup, event handlers, etc.)
  
  return (
    <div className={/* container styling */}>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about recent news..."
          disabled={loading}
          className={/* input styling */}
        />
        
        {/* Voice input button if available */}
        
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className={/* button styling */}
        >
          {/* Send icon or loading spinner */}
        </button>
      </form>
    </div>
  );
}
\`\`\`

## Design Decisions and Potential Improvements

### Design Decisions

1. **Real-time updates with Socket.io**: We chose Socket.io for real-time communication to provide a responsive chat experience
2. **Streaming response UI**: We implemented a UI that shows responses as they're being generated for better user engagement
3. **Theme support**: We added dark/light mode support for better accessibility and user preference
4. **Markdown rendering**: We use React Markdown to render rich text responses with proper formatting
5. **Voice input**: We added voice input support for easier interaction where supported

### Potential Improvements

1. **User authentication**: Add user accounts to personalize the experience
2. **Response feedback**: Allow users to rate the quality of AI responses
3. **Message search**: Add a search feature to find previous conversations
4. **Source citations**: Show which news articles were used for each response
5. **Accessibility improvements**: Enhance keyboard navigation and screen reader support
6. **Mobile app**: Create a native mobile app using React Native
7. **Offline support**: Add service workers for offline functionality
8. **Analytics**: Add usage analytics to track user engagement

## Deployment

This frontend can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages. Make sure to set the `REACT_APP_API_URL` environment variable to point to your deployed backend.

For production deployments, consider:
1. Setting up a CI/CD pipeline for automated deployments
2. Implementing error tracking with services like Sentry
3. Adding analytics to track user engagement
4. Optimizing bundle size for faster loading

## Building for Production

To build the application for production, run:

\`\`\`
npm run build
\`\`\`

This will create a `build` directory with optimized production files.
