function TypingIndicator({ theme }) {
  return (
    <div className={`flex justify-start animate-fadeIn`}>
      <div
        className={`rounded-lg p-3 ${
          theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        } shadow-md rounded-bl-none`}
      >
        <div className="flex space-x-1">
          <div
            className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-gray-400" : "bg-gray-500"} animate-bounce`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-gray-400" : "bg-gray-500"} animate-bounce`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full ${theme === "dark" ? "bg-gray-400" : "bg-gray-500"} animate-bounce`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
