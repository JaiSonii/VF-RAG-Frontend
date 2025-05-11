"use client"

import { FiMoon, FiSun, FiTrash2, FiInfo } from "react-icons/fi"
import { useState } from "react"

function Header({ clearSession, loading, theme, toggleTheme }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <header
      className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b p-4 shadow-sm transition-colors duration-200`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className={`text-xl font-bold ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`}>News Chatbot</h1>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded-full ${
              theme === "dark"
                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiInfo size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              theme === "dark" ? "text-yellow-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            } transition-colors`}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <button
            onClick={clearSession}
            disabled={loading}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm ${
              loading
                ? theme === "dark"
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                : theme === "dark"
                  ? "bg-red-900/50 text-red-200 hover:bg-red-900/70"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
            } transition-colors`}
          >
            <FiTrash2 size={16} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {showInfo && (
        <div
          className={`container mx-auto mt-2 p-3 rounded-md ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          <p className="text-sm">
            This chatbot uses RAG (Retrieval-Augmented Generation) to answer questions about recent news articles. It
            retrieves relevant information from a database of ~50 news articles and uses Google's Gemini AI to generate
            responses.
          </p>
        </div>
      )}
    </header>
  )
}

export default Header
