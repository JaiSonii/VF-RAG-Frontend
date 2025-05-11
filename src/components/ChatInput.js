"use client"

import { useState, useRef, useEffect } from "react"
import { FiSend, FiMic, FiMicOff } from "react-icons/fi"

function ChatInput({ sendMessage, loading, theme }) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const inputRef = useRef(null)

  // Initialize speech recognition if available
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("")

        setMessage(transcript)
      }

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsRecording(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const toggleRecording = () => {
    if (!recognition) return

    if (isRecording) {
      recognition.stop()
    } else {
      recognition.start()
    }

    setIsRecording(!isRecording)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    sendMessage(message)
    setMessage("")

    // Focus the input after sending
    inputRef.current?.focus()

    // Stop recording if active
    if (isRecording && recognition) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  return (
    <div
      className={`border-t ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} p-4 transition-colors duration-200`}
    >
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about recent news..."
          disabled={loading}
          className={`flex-1 border ${
            theme === "dark"
              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-300 focus:ring-blue-500"
              : "border-gray-300 focus:ring-blue-500"
          } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200`}
        />

        {recognition && (
          <button
            type="button"
            onClick={toggleRecording}
            disabled={loading}
            className={`p-3 rounded-lg ${
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600"
                : theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition-colors duration-200`}
          >
            {isRecording ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>
        )}

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className={`p-3 rounded-lg ${
            loading || !message.trim()
              ? theme === "dark"
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } transition-colors duration-200 flex items-center justify-center`}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <FiSend size={20} />
          )}
        </button>
      </form>
    </div>
  )
}

export default ChatInput
