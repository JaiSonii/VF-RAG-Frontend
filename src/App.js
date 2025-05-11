"use client"

import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import ChatMessage from "./components/ChatMessage"
import ChatInput from "./components/ChatInput"
import Header from "./components/Header"
import TypingIndicator from "./components/TypingIndicator"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

function App() {
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState("")
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const [theme, setTheme] = useState("light")

  // Initialize session and socket
  useEffect(() => {
    // Get or create session ID
    const storedSessionId = localStorage.getItem("chatSessionId")
    const newSessionId = storedSessionId || uuidv4()

    if (!storedSessionId) {
      localStorage.setItem("chatSessionId", newSessionId)
    }

    setSessionId(newSessionId)

    // Initialize socket connection
    const newSocket = io(API_URL)
    setSocket(newSocket)

    // Check for theme preference
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")

    // Clean up on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Join session and set up socket event listeners
  useEffect(() => {
    if (!socket || !sessionId) return

    // Join session
    socket.emit("join", sessionId)

    // Load chat history
    fetchChatHistory()

    // Set up event listeners
    socket.on("chat message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })

    socket.on("chat chunk", ({ text, timestamp }) => {
      setMessages((prevMessages) => {
        // Find if we already have a partial message with this timestamp
        const messageIndex = prevMessages.findIndex((msg) => msg.role === "assistant" && msg.timestamp === timestamp)

        if (messageIndex >= 0) {
          // Update existing message
          const updatedMessages = [...prevMessages]
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            content: updatedMessages[messageIndex].content + text,
          }
          return updatedMessages
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
          ]
        }
      })
    })

    socket.on("chat complete", (message) => {
      setMessages((prevMessages) => {
        // Remove any partial messages with this timestamp
        const filteredMessages = prevMessages.filter(
          (msg) => !(msg.role === "assistant" && msg.timestamp === message.timestamp && msg.isPartial),
        )
        // Add the complete message
        return [...filteredMessages, message]
      })
      setLoading(false)
    })

    socket.on("typing", (status) => {
      setIsTyping(status)
    })

    socket.on("session cleared", () => {
      setMessages([])
      setLoading(false)
      setIsTyping(false)
    })

    socket.on("error", (error) => {
      console.error("Socket error:", error)
      setLoading(false)
      setIsTyping(false)
    })

    // Clean up event listeners on unmount
    return () => {
      socket.off("chat message")
      socket.off("chat chunk")
      socket.off("chat complete")
      socket.off("typing")
      socket.off("session cleared")
      socket.off("error")
    }
  }, [socket, sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Fetch chat history from the server
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/history/${sessionId}`)
      setMessages(response.data.history)
    } catch (error) {
      console.error("Error fetching chat history:", error)
    }
  }

  // Send message via socket
  const sendMessage = (message) => {
    if (!socket || !message.trim() || loading) return

    setLoading(true)
    socket.emit("chat message", { message, sessionId })
  }

  // Clear session
  const clearSession = () => {
    if (!socket) return

    setLoading(true)
    socket.emit("clear session", sessionId)
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      className={`flex flex-col h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} transition-colors duration-200`}
    >
      <Header clearSession={clearSession} loading={loading} theme={theme} toggleTheme={toggleTheme} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div
              className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"} max-w-md p-6 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-lg`}
            >
              <h2 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Welcome to the News Chatbot!
              </h2>
              <p className="mb-4">Ask me anything about recent news.</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <button
                  onClick={() => sendMessage("India and Pakistan Ceasefire?")}
                  className={`p-2 rounded-md text-left ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} transition-colors`}
                >
                  India and Pakistan Ceasefire?
                </button>
                <button
                  onClick={() => sendMessage("News about Russia and Ukraine?")}
                  className={`p-2 rounded-md text-left ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} transition-colors`}
                >
                  News about Russia and Ukraine?
                </button>
                <button
                  onClick={() => sendMessage("What's happening in global politics?")}
                  className={`p-2 rounded-md text-left ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} transition-colors`}
                >
                  What's happening in global politics?
                </button>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={`${message.role}-${message.timestamp}-${index}`} message={message} theme={theme} />
          ))
        )}
        {isTyping && <TypingIndicator theme={theme} />}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput sendMessage={sendMessage} loading={loading} theme={theme} />
    </div>
  )
}

export default App
