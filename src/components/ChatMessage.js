import { formatDistanceToNow } from "date-fns"
import ReactMarkdown from "react-markdown"

function ChatMessage({ message, theme }) {
  const { role, content, timestamp } = message
  const isUser = role === "user"
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true })

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? `bg-blue-600 text-white rounded-br-none ${theme === "dark" ? "shadow-blue-900/20" : "shadow-blue-500/20"}`
            : theme === "dark"
              ? "bg-gray-800 text-white rounded-bl-none shadow-md"
              : "bg-white text-gray-800 rounded-bl-none shadow-md"
        } shadow-lg transition-all duration-200`}
      >
        <div className={`prose prose-sm max-w-none ${theme === "dark" ? "prose-invert" : ""}`}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div
          className={`text-xs mt-2 ${isUser ? "text-blue-200" : theme === "dark" ? "text-gray-300" : "text-gray-500"}`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
